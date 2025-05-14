package com.bodyassistant;

import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.media.Image;
import android.os.Build;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessor.Frame;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;

@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
public class JpegFrameProcessorPlugin extends FrameProcessorPlugin {

  public JpegFrameProcessorPlugin() {
    super("getJpegFrame");
  }

  @Override
  public Object callback(Frame frame, Map<String, Object> params) {
    try {
      Image image = frame.getImage();
      if (image.getFormat() != ImageFormat.YUV_420_888) {
        Log.e("JpegFrame", "Unsupported image format: " + image.getFormat());
        return null;
      }

      ByteBuffer yBuffer = image.getPlanes()[0].getBuffer();
      ByteBuffer uBuffer = image.getPlanes()[1].getBuffer();
      ByteBuffer vBuffer = image.getPlanes()[2].getBuffer();

      int ySize = yBuffer.remaining();
      int uSize = uBuffer.remaining();
      int vSize = vBuffer.remaining();

      byte[] nv21 = new byte[ySize + uSize + vSize];

      yBuffer.get(nv21, 0, ySize);
      vBuffer.get(nv21, ySize, vSize);
      uBuffer.get(nv21, ySize + vSize, uSize);

      YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, image.getWidth(), image.getHeight(), null);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      yuvImage.compressToJpeg(new Rect(0, 0, image.getWidth(), image.getHeight()), 90, out);

      byte[] jpegData = out.toByteArray();
      String base64Jpeg = Base64.encodeToString(jpegData, Base64.NO_WRAP);

      Map<String, Object> result = new HashMap<>();
      result.put("jpeg", base64Jpeg);

      return result;
    } catch (Exception e) {
      Log.e("JpegFrame", "Failed to process frame", e);
      return null;
    }
  }
}
