package ph.paddleup.offline;
import java.io.*;
public class LanTransportHarness {
 public static void main(String[] args)throws Exception{
  LanTransport transport=new LanTransport(new LanTransport.Listener(){public void event(String kind,String peer,String data){System.out.println(kind+"\t"+peer+"\t"+data);System.out.flush();}});
  transport.host(0,"123456");System.out.println("PORT\t"+transport.port());System.out.flush();
  BufferedReader in=new BufferedReader(new InputStreamReader(System.in));String line;while((line=in.readLine())!=null){if(line.equals("STOP"))break;if(line.startsWith("SEND\t")){String[] p=line.split("\t",3);transport.send(p[1],p[2]);}}
  transport.close();
 }
}
