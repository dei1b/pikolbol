package ph.paddleup.offline;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import javax.net.ssl.HttpsURLConnection;
import org.json.JSONArray;
import org.json.JSONObject;

public final class AppUpdates {
    private static final String RELEASES = "https://github.com/dei1b/pikolbol/releases";
    private static final String LATEST = "https://api.github.com/repos/dei1b/pikolbol/releases/latest";
    private final Activity activity;
    private final String version;
    private boolean checking;

    AppUpdates(Activity activity) throws android.content.pm.PackageManager.NameNotFoundException {
        this.activity = activity;
        version = activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0).versionName;
    }

    @JavascriptInterface public String version() { return version; }

    @JavascriptInterface public void check() {
        activity.runOnUiThread(() -> {
            if (checking || activity.isFinishing() || activity.isDestroyed()) return;
            checking = true;
            AlertDialog dialog = new AlertDialog.Builder(activity)
                .setTitle("App updates")
                .setMessage("Checking for updates…")
                .setPositiveButton("OK", null)
                .setNeutralButton("View releases", (d, w) -> openReleases())
                .show();
            new Thread(() -> {
                String message = checkLatest();
                activity.runOnUiThread(() -> {
                    checking = false;
                    if (!activity.isFinishing() && !activity.isDestroyed() && dialog.isShowing()) {
                        dialog.setMessage("Installed version: " + version + "\n\n" + message);
                    }
                });
            }, "rally-update-check").start();
        });
    }

    private String checkLatest() {
        HttpsURLConnection connection = null;
        try {
            connection = (HttpsURLConnection) new URL(LATEST).openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setRequestProperty("Accept", "application/vnd.github+json");
            int status = connection.getResponseCode();
            if (status == 404) return "No Android release is currently published.";
            if (status != 200) return "GitHub is unavailable for update checks right now. Try again later.";

            StringBuilder body = new StringBuilder();
            try (InputStreamReader reader = new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8)) {
                char[] buffer = new char[4096];
                int count;
                while ((count = reader.read(buffer)) != -1) {
                    body.append(buffer, 0, count);
                    if (body.length() > 262144) return "Could not read the release information.";
                }
            }
            JSONObject release = new JSONObject(body.toString());
            JSONArray assets = release.optJSONArray("assets");
            boolean hasApk = false;
            for (int i = 0; assets != null && i < assets.length(); i++) {
                JSONObject asset = assets.getJSONObject(i);
                if ("Rally-Offline.apk".equals(asset.optString("name")) && "uploaded".equals(asset.optString("state"))) {
                    hasApk = true;
                    break;
                }
            }
            if (!hasApk) return "The latest release has no Android installer.";
            String latest = release.getString("tag_name").replaceFirst("^v", "");
            if (compareVersions(latest, version) > 0) {
                return "Version " + latest + " is available. Open releases to download it.";
            }
            return "You have the latest Android version.";
        } catch (Exception error) {
            return "Could not check for updates. Check your internet connection and try again.";
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    static int compareVersions(String left, String right) {
        if (!left.matches("[0-9]{1,9}(\\.[0-9]{1,9}){2}") || !right.matches("[0-9]{1,9}(\\.[0-9]{1,9}){2}")) {
            throw new IllegalArgumentException("Expected major.minor.patch");
        }
        String[] a = left.split("\\.");
        String[] b = right.split("\\.");
        for (int i = 0; i < a.length; i++) {
            int comparison = Integer.compare(Integer.parseInt(a[i]), Integer.parseInt(b[i]));
            if (comparison != 0) return comparison;
        }
        return 0;
    }

    private void openReleases() {
        try {
            activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(RELEASES)));
        } catch (ActivityNotFoundException error) {
            new AlertDialog.Builder(activity).setMessage(RELEASES).setPositiveButton("OK", null).show();
        }
    }
}
