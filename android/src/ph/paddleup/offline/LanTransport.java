package ph.paddleup.offline;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

/** Native local-network transport. No WebView network-policy exceptions are required. */
public final class LanTransport implements Closeable {
 public interface Listener { void event(String kind,String peer,String data); }
 private final Listener listener;
 private final ConcurrentHashMap<String,Peer> peers=new ConcurrentHashMap<>();
 private final ConcurrentHashMap<Socket,InputStream> streams=new ConcurrentHashMap<>();
 private final Set<Socket> pending=Collections.newSetFromMap(new ConcurrentHashMap<Socket,Boolean>());
 private final ScheduledExecutorService clock=Executors.newSingleThreadScheduledExecutor();
 private final Semaphore handshakes=new Semaphore(8);
 private volatile boolean closed=false,hosting=false;
 private volatile ServerSocket server;
 private String code;
 private final AtomicInteger ids=new AtomicInteger(); private long attemptWindow=System.nanoTime(); private int attempts=0;
 public LanTransport(Listener listener){this.listener=listener;clock.scheduleAtFixedRate(()->{for(Peer p:peers.values())p.offer("!");},2,2,TimeUnit.SECONDS);}
 private void event(String kind,String peer,String data){if(!closed)try{listener.event(kind,peer,data);}catch(RuntimeException ignored){}}
 private static Thread thread(String name,Runnable job){Thread t=new Thread(job,name);t.setDaemon(true);t.start();return t;}
 public static boolean privateAddress(String ip){if(ip==null||!ip.matches("[0-9]{1,3}(\\.[0-9]{1,3}){3}"))return false;String[] parts=ip.split("\\.");int[] b=new int[4];for(int i=0;i<4;i++){b[i]=Integer.parseInt(parts[i]);if(b[i]>255)return false;}return b[0]==10||b[0]==192&&b[1]==168||b[0]==172&&b[1]>=16&&b[1]<=31||b[0]==169&&b[1]==254;}
 public static List<String> addresses(){List<String> result=new ArrayList<>();try{Enumeration<NetworkInterface> all=NetworkInterface.getNetworkInterfaces();while(all.hasMoreElements()){NetworkInterface n=all.nextElement();if(!n.isUp()||n.isLoopback())continue;Enumeration<InetAddress> ips=n.getInetAddresses();while(ips.hasMoreElements()){InetAddress ip=ips.nextElement();if(ip instanceof Inet4Address&&privateAddress(ip.getHostAddress()))result.add(ip.getHostAddress());}}}catch(SocketException ignored){}return result;}
 public synchronized void host(int port,String pin)throws IOException{if(server!=null||closed)throw new IOException("Already hosting");if(!pin.matches("[0-9]{6}"))throw new IOException("Invalid room code");code=pin;hosting=true;server=new ServerSocket();server.setReuseAddress(true);server.bind(new InetSocketAddress("0.0.0.0",port));thread("Rally LAN accept",()->{while(!closed){try{Socket s=server.accept();if(!(privateAddress(s.getInetAddress().getHostAddress())||s.getInetAddress().isLoopbackAddress())||!handshakes.tryAcquire()){s.close();continue;}pending.add(s);thread("Rally LAN handshake",()->accept(s));}catch(IOException e){if(!closed)event("error","", "Could not accept LAN connection");break;}}});}
 public int port(){return server==null?0:server.getLocalPort();}
 private static String line(InputStream in)throws IOException{ByteArrayOutputStream bytes=new ByteArrayOutputStream();while(true){int b=in.read();if(b<0)throw new EOFException();if(b==10)break;if(b==13)continue;if(bytes.size()>=65536)throw new IOException("message-too-large");bytes.write(b);}return new String(bytes.toByteArray(),StandardCharsets.UTF_8);}
 private String line(Socket socket)throws IOException{InputStream in=streams.get(socket);if(in==null){in=new BufferedInputStream(socket.getInputStream(),16384);streams.put(socket,in);}return line(in);}
 private static void write(Socket s,String value)throws IOException{s.getOutputStream().write((value+"\n").getBytes(StandardCharsets.UTF_8));s.getOutputStream().flush();}
 private void accept(Socket s){boolean adopted=false;try{s.setSoTimeout(5000);s.setTcpNoDelay(true);String header=line(s);String failure=!header.startsWith("RALLYLAN/1 ")?"version-mismatch":!header.startsWith("RALLYLAN/1 lan-1 ")?"version-mismatch":!header.equals("RALLYLAN/1 lan-1 "+code)?"wrong-code":null;
   synchronized(peers){if(closed)return;long stamp=System.nanoTime();if(stamp-attemptWindow>10000000000L){attemptWindow=stamp;attempts=0;}if(++attempts>12)failure="try-again";if(failure==null&&peers.size()>=3)failure="room-full";if(failure!=null){write(s,"ERROR "+failure);return;}String id="p"+ids.incrementAndGet();write(s,"WELCOME "+id);Peer peer=new Peer(id,s);peers.put(id,peer);adopted=true;event("connected",id,"");peer.start();}
  }catch(IOException ignored){}finally{pending.remove(s);handshakes.release();if(!adopted){streams.remove(s);try{s.close();}catch(IOException ignored){}}}}
 public void join(String host,int port,String pin){if(!privateAddress(host)||port<1||port>65535||pin==null||!pin.matches("[0-9]{6}")){event("error","","invalid-address-or-code");return;}thread("Rally LAN connect",()->{Socket s=new Socket();boolean adopted=false;pending.add(s);try{s.connect(new InetSocketAddress(host,port),5000);s.setSoTimeout(6000);s.setTcpNoDelay(true);write(s,"RALLYLAN/1 lan-1 "+pin);String reply=line(s);if(!reply.matches("WELCOME p[0-9]+")){event("error","",reply.startsWith("ERROR ")?reply.substring(6):"bad-handshake");return;}Peer peer=new Peer("host",s);synchronized(peers){if(closed)return;peers.put("host",peer);adopted=true;event("connected","host",reply.substring(8));peer.start();}}catch(IOException error){event("error","","connection-failed");}finally{pending.remove(s);if(!adopted){streams.remove(s);try{s.close();}catch(IOException ignored){}}}});}
 public void send(String peer,String message){if(message==null||message.indexOf('\n')>=0||message.indexOf('\r')>=0||message.getBytes(StandardCharsets.UTF_8).length>65536)return;if("*".equals(peer)){for(Peer p:peers.values())p.offer(message);}else{Peer p=peers.get(peer);if(p!=null)p.offer(message);}}
 public void disconnect(String id){Peer p=peers.get(id);if(p!=null)p.end("left-room");}
 public void background(){if(hosting){send("*","{\"type\":\"hostPause\",\"paused\":true}");event("message","self","{\"type\":\"pause\",\"paused\":true}");}else send("host","{\"type\":\"pause\",\"paused\":true}");}
 private final class Peer {
  final String id;final Socket socket;final ArrayBlockingQueue<String> writes=new ArrayBlockingQueue<>(64);final AtomicBoolean ended=new AtomicBoolean();
  Peer(String id,Socket socket)throws SocketException{this.id=id;this.socket=socket;socket.setSoTimeout(12000);socket.setKeepAlive(true);}
  void offer(String message){if(!ended.get()&&!writes.offer(message))end("connection-too-slow");}
  void start(){thread("Rally LAN writer",()->{try{while(!ended.get()&&!closed)write(socket,writes.take());}catch(Exception error){end("connection-lost");}});thread("Rally LAN reader",()->{try{long window=System.nanoTime();int count=0;while(!closed&&!ended.get()){String value=line(socket);if(value.equals("!"))continue;long now=System.nanoTime();if(now-window>1000000000L){window=now;count=0;}if(++count>180)throw new IOException("rate-limit");event("message",id,value);}}catch(IOException error){end(error instanceof SocketTimeoutException?"connection-timeout":"connection-lost");}});}
  void end(String reason){if(!ended.compareAndSet(false,true))return;peers.remove(id,this);streams.remove(socket);try{socket.close();}catch(IOException ignored){}writes.offer("!");event("disconnected",id,reason);}
 }
 @Override public synchronized void close(){if(closed)return;closed=true;try{if(server!=null)server.close();}catch(IOException ignored){}for(Socket s:pending)try{s.close();}catch(IOException ignored){}pending.clear();synchronized(peers){for(Peer p:peers.values())p.end("room-closed");peers.clear();streams.clear();}clock.shutdownNow();}
}
