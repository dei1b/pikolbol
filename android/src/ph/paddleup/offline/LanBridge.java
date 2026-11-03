package ph.paddleup.offline;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import java.security.SecureRandom;
import org.json.*;

public final class LanBridge {
 private final WebView view;private LanTransport transport;private int generation=0;
 public LanBridge(WebView view){this.view=view;}
 private void emit(int token,String kind,String peer,String data){view.post(()->{if(token!=generation)return;try{JSONObject e=new JSONObject();e.put("kind",kind);e.put("peer",peer);e.put("data",data);view.evaluateJavascript("window.RallyLan&&window.RallyLan.receive("+e.toString()+")",null);}catch(JSONException ignored){}});}
 private LanTransport fresh(){stop();final int token=generation;transport=new LanTransport((k,p,d)->emit(token,k,p,d));return transport;}
 @JavascriptInterface public synchronized void host(){LanTransport t=fresh();try{String code=String.format(java.util.Locale.US,"%06d",new SecureRandom().nextInt(1000000));try{t.host(9438,code);}catch(java.io.IOException busy){t.close();final int token=generation;transport=t=new LanTransport((k,p,d)->emit(token,k,p,d));t.host(0,code);}JSONObject info=new JSONObject();info.put("port",t.port());info.put("code",code);info.put("addresses",new JSONArray(LanTransport.addresses()));emit(generation,"hosting","",info.toString());}catch(Exception error){emit(generation,"error","","Could not host on this network.");}}
 @JavascriptInterface public synchronized void join(String host,int port,String code){fresh().join(host,port,code);}
 @JavascriptInterface public synchronized void send(String peer,String message){if(transport!=null)transport.send(peer,message);}
 @JavascriptInterface public synchronized void disconnect(String peer){if(transport!=null)transport.disconnect(peer);}
 @JavascriptInterface public synchronized void stop(){generation++;if(transport!=null){transport.close();transport=null;}}
 public synchronized void background(){if(transport!=null)transport.background();}
}
