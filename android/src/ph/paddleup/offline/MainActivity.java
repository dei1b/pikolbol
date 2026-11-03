package ph.paddleup.offline;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.net.Uri;
import android.view.View;
import android.view.WindowManager;
import android.webkit.*;
import java.io.*;
import java.util.*;

public class MainActivity extends Activity {
    private WebView game;
    private LanBridge lan;
    private PermissionRequest cameraRequest;
    private static final int CAMERA_PERMISSION=71;
    private static final String HOST = "appassets.androidplatform.net";
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(0xff10201b);
        getWindow().setNavigationBarColor(0xff10201b);
        game = new WebView(this);
        game.setBackgroundColor(0xff10201b);
        WebSettings settings=game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        WebView.setWebContentsDebuggingEnabled(true);
        game.setWebChromeClient(new WebChromeClient(){
            @Override public void onPermissionRequest(PermissionRequest request){runOnUiThread(()->{
                Uri origin=request.getOrigin();String[] resources=request.getResources();
                if(!"https".equals(origin.getScheme())||!HOST.equals(origin.getHost())||resources.length!=1||!PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resources[0])){request.deny();return;}
                if(cameraRequest!=null){request.deny();return;}
                if(checkSelfPermission(android.Manifest.permission.CAMERA)==android.content.pm.PackageManager.PERMISSION_GRANTED){request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});return;}
                cameraRequest=request;requestPermissions(new String[]{android.Manifest.permission.CAMERA},CAMERA_PERMISSION);
            });}
            @Override public void onPermissionRequestCanceled(PermissionRequest request){runOnUiThread(()->{if(cameraRequest==request)cameraRequest=null;});}
            @Override public boolean onConsoleMessage(ConsoleMessage m){
                android.util.Log.d("RallyWeb",m.messageLevel()+": "+m.message()+" ("+m.sourceId()+":"+m.lineNumber()+")");return true;
            }
        });
        game.setWebViewClient(new WebViewClient(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
                Uri url=request.getUrl();
                if(!"https".equals(url.getScheme())||!HOST.equals(url.getHost()))return response("text/plain",403,"Offline",new ByteArrayInputStream(new byte[0]));
                String file=url.getPath();if(file==null||file.equals("/"))file="/index.html";
                if(file.contains("..")||file.contains("\\"))return response("text/plain",403,"Forbidden",new ByteArrayInputStream(new byte[0]));
                if(file.startsWith("/live/"))return response("application/json",503,"Offline",new ByteArrayInputStream("{\"error\":\"Offline edition\"}".getBytes()));
                try{return response(mime(file),200,"OK",getAssets().open(file.substring(1)));}
                catch(IOException error){android.util.Log.w("RallyWeb","Missing asset: "+file);return response("text/plain",404,"Not Found",new ByteArrayInputStream(new byte[0]));}
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                return !HOST.equals(request.getUrl().getHost());
            }
        });
        lan=new LanBridge(game);
        game.addJavascriptInterface(lan,"RallyLanNative");
        setContentView(game);fullscreen();
        game.loadUrl("https://"+HOST+"/");
    }
    private static WebResourceResponse response(String mime,int status,String reason,InputStream stream){
        Map<String,String> headers=new HashMap<>();
        headers.put("Cache-Control","no-cache");
        headers.put("Content-Security-Policy","default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' data: blob:; worker-src 'self' blob:; object-src 'none'");
        return new WebResourceResponse(mime,mime.startsWith("text/")||mime.contains("json")?"UTF-8":null,status,reason,headers,stream);
    }
    private static String mime(String file){
        if(file.endsWith(".html"))return "text/html";
        if(file.endsWith(".js"))return "text/javascript";
        if(file.endsWith(".css"))return "text/css";
        if(file.endsWith(".png"))return "image/png";
        if(file.endsWith(".svg"))return "image/svg+xml";
        if(file.endsWith(".woff2"))return "font/woff2";
        if(file.endsWith(".gltf"))return "model/gltf+json";
        if(file.endsWith(".json")||file.endsWith(".webmanifest"))return "application/json";
        return "application/octet-stream";
    }
    private void fullscreen(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);}
    @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results){super.onRequestPermissionsResult(code,permissions,results);if(code==CAMERA_PERMISSION&&cameraRequest!=null){PermissionRequest request=cameraRequest;cameraRequest=null;if(results.length>0&&results[0]==android.content.pm.PackageManager.PERMISSION_GRANTED)request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});else request.deny();}}
    @Override public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus)fullscreen();}
    private void pauseMatch(){game.evaluateJavascript("if(document.querySelector('[data-match-overlay][data-paused=\"false\"]'))window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape'}))",null);}
    @Override protected void onPause(){if(lan!=null)lan.background();game.evaluateJavascript("window.RallyLanQR&&window.RallyLanQR.stop()",null);pauseMatch();game.onPause();super.onPause();}
    @Override protected void onResume(){super.onResume();if(game!=null)game.onResume();}
    @Override public void onBackPressed(){
        pauseMatch();
        new AlertDialog.Builder(this).setTitle("Close Rally?").setMessage("Your settings and tournament progress are saved on this phone.").setPositiveButton("Close",(d,w)->finish()).setNegativeButton("Keep playing",(d,w)->fullscreen()).show();
    }
    @Override protected void onDestroy(){if(cameraRequest!=null){cameraRequest.deny();cameraRequest=null;}if(lan!=null)lan.stop();if(game!=null){game.removeJavascriptInterface("RallyLanNative");game.stopLoading();game.destroy();}super.onDestroy();}
}
