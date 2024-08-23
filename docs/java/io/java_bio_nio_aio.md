# Java BIO NIO AIO

> 原文: [从理论到实践：深度解读BIO、NIO、AIO的优缺点及使用场景 -- 索码理](https://mp.weixin.qq.com/s/ITJlhJrY_IWB8KH1cEbE2w) 对文章内描述进行部分修改，本机重跑了代码，隐藏了美女图片 :rofl:

BIO、NIO 和 AIO 是Java编程语言中用于处理输入输出（IO）操作的三种不同的机制，它们分别代表同步阻塞I/O，同步非阻塞I/O和异步非阻塞I/O。

## BIO

`BIO（Blocking IO）` 是最传统的IO模型，也称为同步阻塞IO。它实现的是同步阻塞模型，即服务器实现模式为一个连接一个线程，即客户端有连接请求时，服务器端就需要启动一个线程进行处理。  
如果这个连接不做任何事情会造成不必要的线程开销，并且线程在进行IO操作期间是被阻塞的，无法进行其他任务。在高并发环境下，BIO的性能较差，因为它需要为每个连接创建一个线程，而且线程切换开销较大，不过可以通过线程池机制改善。BIO适合一些简单的、低频的、短连接的通信场景，例如HTTP请求。

![BIO模型](/img/java_bio.png)

### 优缺点

**优点：**

- **简单易用：** BIO模型的编程方式相对简单，易于理解和使用。
- **可靠性高：** 由于阻塞特性，IO操作的结果是可靠的。

**缺点：**

- **阻塞等待：** 当一个IO操作被阻塞时，线程会一直等待，无法执行其他任务，导致资源浪费。
- **并发能力有限：** 每个连接都需要一个独立的线程，当连接数增加时，线程数量也会增加，造成资源消耗和性能下降。
- 由于I/O操作是同步的，客户端的连接需要等待服务器响应，会降低系统的整体性能。

### 示例代码

BIO 服务端

```java
import java.io.*;
import java.net.*;

public class BIOServer {
    public static void main(String[] args) throws IOException {
        ServerSocket serverSocket = null;
        Socket clientSocket = null;

        try {
            //创建服务端
            serverSocket = new ServerSocket(8888);
            System.out.println("服务端已启动，等待客户端连接...");

            while (true) {
                // 监听客户端请求，接收不到请求会一直等待
                clientSocket = serverSocket.accept();
                int port = clientSocket.getPort();
                InetAddress inetAddress = clientSocket.getInetAddress();
                System.out.println("客户端 " + inetAddress + ":" + port + " 连接成功！");
                //处理客户端消息
                new Thread(new ServerHandler(clientSocket)).start();
            }
        } catch (IOException e) {
            System.out.println("客户端连接失败：" + e.getMessage());
        } finally {
            try {
                if (clientSocket != null) {
                    clientSocket.close();
                }
                if (serverSocket != null) {
                    serverSocket.close();
                }
            } catch (IOException e) {
                System.out.println("关闭资源失败：" + e.getMessage());
            }
        }
    }
}

```

服务端消息处理.

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.Socket;

/**
 * BIO 处理消息.
 */
public class ServerHandler implements Runnable {

    private Socket clientSocket;

    public ServerHandler(Socket clientSocket) {
        this.clientSocket = clientSocket;
    }

    @Override
    public void run() {
        //获取客户端输入流以便接收客户端数据
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            //获取客户端输出流以便向客户端发送数据
            PrintWriter out = new PrintWriter(clientSocket.getOutputStream());

            int port = clientSocket.getPort();
            InetAddress inetAddress = clientSocket.getInetAddress();
            String address = inetAddress + ":" + port;

            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                //接收客户端消息
                System.out.println("客户端" + address + "发来消息：" + inputLine);
                //给客户端发送消息
                out.println("服务端已接收到消息并回复：" + inputLine);
                out.flush();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

客户端代码：

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Scanner;

/**
 * BIO 客户端代码.
 */
public class BIOClient {

    public static void main(String[] args) throws IOException {
        Socket clientSocket = null;
        BufferedReader in = null;
        PrintWriter out = null;
        try {
            //绑定服务端ip和端口号
            clientSocket = new Socket("localhost", 8888);
            System.out.println("连接服务端成功！");
            //获取输入流，接收服务端消息
            in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            //获取输出流,给服务端发送消息
            out = new PrintWriter(clientSocket.getOutputStream(), true);

            Scanner scanner = new Scanner(System.in);
            while (true) {
                System.out.print("给服务端发送消息：");
                String msg = scanner.nextLine();
                out.println(msg);

                // 输入 bye 就退出
                if ("bye".equals(msg)) {
                    break;
                }

                String response;
                if ((response = in.readLine()) != null) {
                    //接收服务端响应
                    System.out.println("服务端响应：" + response);
                }
            }
        } catch (IOException e) {
            System.out.println("连接服务端失败：" + e.getMessage());
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
                if (out != null) {
                    out.close();
                }
                if (clientSocket != null) {
                    clientSocket.close();
                }
            } catch (IOException e) {
                System.out.println("关闭资源失败：" + e.getMessage());
            }
        }
    }
}

```

运行结果：

服务端的消息

```shell
服务端已启动，等待客户端连接...
客户端 /127.0.0.1:56827 连接成功！
客户端/127.0.0.1:56827发来消息：hello server, I'm tony
客户端/127.0.0.1:56827发来消息：干啥呢，出来嗨 💃
客户端/127.0.0.1:56827发来消息：不去，拉到
客户端/127.0.0.1:56827发来消息：bye
客户端 /127.0.0.1:57198 连接成功！
客户端/127.0.0.1:57198发来消息：新服务端
客户端/127.0.0.1:57198发来消息：你出去玩不
```

客户端1
```shell
连接服务端成功！
给服务端发送消息：hello server, I'm tony
服务端响应：服务端已接收到消息并回复：hello server, I'm tony
给服务端发送消息：干啥呢，出来嗨 💃
服务端响应：服务端已接收到消息并回复：干啥呢，出来嗨 💃
给服务端发送消息：不去，拉到
服务端响应：服务端已接收到消息并回复：不去，拉到
给服务端发送消息：bye
```

新开一个，客户端2
```shell
连接服务端成功！
给服务端发送消息：新服务端
服务端响应：服务端已接收到消息并回复：新服务端
给服务端发送消息：你出去玩不
服务端响应：服务端已接收到消息并回复：你出去玩不
给服务端发送消息：
```

上述代码只是简单演示了如何使用BIO模型一个服务端接收并处理多个客户端请求情况。在这里创建了3个类，分别为服务端 `BIOServer`、多线程客户端处理类`ServerHandler` 和 客户端`BIOClient`，接着分别启动服务端`BIOServer`和两个客户端`BIOClient`，并在客户端中接收键盘输入的字符串发送给服务端，最后服务端把接收到的数据再返回给客户端。

由于BIO的特性，所以在服务端中需要为每个连接创建一个线程，也可以通过线程池进行优化，这里只是简单演示不做过多设计。

## NIO

`NIO` 是Java 1.4引入的新IO模型，也称为同步非阻塞IO，它提供了一种基于事件驱动的方式来处理I/O操作。

相比于传统的BIO模型，NIO采用了`Channel`、`Buffer`和`Selector`等组件，线程可以对某个IO事件进行监听，并继续执行其他任务，不需要阻塞等待。当IO事件就绪时，线程会得到通知，然后可以进行相应的操作，实现了非阻塞式的高伸缩性网络通信。在NIO模型中，数据总是从Channel读入Buffer，或者从Buffer写入Channel，这种模式提高了IO效率，并且可以充分利用系统资源。

NIO主要由三部分组成：选择器（Selector）、缓冲区（Buffer）和通道（Channel）。Channel是一个可以进行数据读写的对象，所有的数据都通过Buffer来处理，这种方式避免了直接将字节写入通道中，而是将数据写入包含一个或者多个字节的缓冲区。在多线程模式下，一个线程可以处理多个请求，这是通过将客户端的连接请求注册到多路复用器上，然后由多路复用器轮询到连接有I/O请求时进行处理。

对于NIO，如果从特性来看，它是非阻塞式IO，N是Non-Blocking的意思；如果从技术角度，NIO对于BIO来说是一个新技术，N的意思是New的意思。所以NIO也常常被称作Non-Blocking I/O或New I/O。

NIO适用于连接数目多且连接比较短（轻操作）的架构，例如聊天服务器、弹幕系统、服务器间通讯等。它通过引入非阻塞通道的概念，提高了系统的伸缩性和并发性能。同时，NIO的使用也简化了程序编写，提高了开发效率。


![NIO模型](/img/java_nio.png)

### 优缺点

**优点：**

- **高并发性：** 使用选择器（Selector）和通道（Channel）的NIO模型可以在单个线程上处理多个连接，提供更高的并发性能。
- **节省资源：** 相对于BIO，NIO需要更少的线程来处理相同数量的连接，节省了系统资源。
- **灵活性：** NIO提供了多种类型的Channel和Buffer，可以根据需要选择适合的类型。NIO允许开发人员自定义协议、编解码器等组件，从而提高系统的灵活性和可扩展性。
- **高性能：** NIO采用了基于通道和缓冲区的方式来读写数据，这种方式比传统的流模式更高效。可以减少数据拷贝次数，提高数据处理效率。
- **内存管理：**NIO允许用户手动管理缓冲区的内存分配和回收，避免了传统I/O模型中的内存泄漏问题。

**缺点：**

- **编程复杂：** 相对于BIO，NIO的编程方式更加复杂，需要理解选择器和缓冲区等概念，也需要考虑多线程处理和同步问题。
- **可靠性较低：** NIO模型中，一个连接的读写操作是非阻塞的，无法保证IO操作的结果是可靠的，可能会出现部分读写或者错误的数据。
- NIO适合一些复杂的、高频的、长连接的通信场景，例如聊天室、网络游戏等。


### 示例代码

在看代码之前先了解 NIO 中3个非常重要的组件，**选择器（Selector）**、**缓冲区（Buffer）** 和 **通道（Channel）**：

- **通道（Channel）：** Channel 是NIO中用于数据读写的双向通道，可以从通道中读取数据，也可以将数据写入通道。与传统的IO不同，Channel是双向的，可以同时进行读写操作，而传统的IO只能通过 **InputStream** 或 **OutputStream** 进行单向读写。Java NIO 中常见的 Channel 有：**FileChannel（文件读写）**、**DatagramChannel（UDP协议）**、**SocketChannel（TCP协议）**和**ServerSocketChannel（监听TCP连接请求）**等。

- **缓冲区（Buffer）：** Buffer是 NIO 中用于存储数据的缓冲区，可以理解为一个容器，可以从中读取数据，也可以将数据写入其中。Buffer具有一组指针来跟踪当前位置、限制和容量等属性。Java NIO中提供了多种类型的Buffer，例如 **ByteBuffer**、**CharBuffer**、**ShortBuffer**、**IntBuffer**等。每种类型的Buffer都有自己特定的读写方法，可以使用`get()`和`put()`等方法来读写缓冲区中的数据。

- **选择器（Selector）：** Selector是 NIO 中用于监控多个 Channel 的选择器，可以实现单线程管理多个Channel。Selector可以检测多个Channel是否有事件发生，包括连接、接收、读取和写入等事件，并根据不同的事件类型进行相应处理。Selector可以有效地减少单线程管理多个Channel时的资源占用，提高程序的运行效率。

NIO的操作流程如下：

1. 打开通道并设置为非阻塞模式。
2. 将通道注册到选择器上，并指定感兴趣的事件类型（如连接打开、可读等）。
3. 线程通过调用选择器的select()方法等待事件发生。
4. 当有一个或多个事件发生时，线程可以从选择器中获取已经准备好的通道，并进行相应的IO操作。
5. IO操作完成后，关闭通道和选择器。

下面通过两段代码展示一下NIO的操作流程和使用方式。

服务端代码：

```java
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Scanner;
import java.util.Set;

public class NIOServer {
    public static void main(String[] args) throws IOException {
        Selector selector = Selector.open();
        // 创建一个ServerSocketChannel并绑定到指定的端口
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        serverSocketChannel.bind(new InetSocketAddress(9999));
        // 设置为非阻塞模式
        serverSocketChannel.configureBlocking(false);
        // 将ServerSocketChannel注册到Selector上，并监听OP_ACCEPT事件
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
        System.out.println("服务器已启动，等待客户端连接...");

        while (true) {
            // 阻塞，等待事件发生
            selector.select();

            Set<SelectionKey> selectedKeys = selector.selectedKeys();
            Iterator<SelectionKey> keyIterator = selectedKeys.iterator();
            while (keyIterator.hasNext()) {
                SelectionKey key = keyIterator.next();

                if (key.isAcceptable()) {     // 处理连接请求事件
                    SocketChannel client = serverSocketChannel.accept();
                    client.configureBlocking(false);
                    //监听OP_ACCEPT事件
                    client.register(selector, SelectionKey.OP_READ);
                } else if (key.isReadable()) {
                    SocketChannel client = (SocketChannel) key.channel();
                    client.getRemoteAddress();
                    //分配缓存区容量
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    client.read(buffer);
                    String output = new String(buffer.array()).trim();

                    Socket socket = client.socket();
                    InetAddress inetAddress = socket.getInetAddress();
                    int port = socket.getPort();
                    String clientInfo = inetAddress + ":" + port;
                    String message = String.format("来自客户端 %s , 消息：%s", clientInfo, output);
                    System.out.println(message);

                    responseMessage(selector, client, buffer);
                }

                keyIterator.remove();
            }
        }
    }

    private static void responseMessage(Selector selector, SocketChannel client, ByteBuffer buffer) throws IOException {

        buffer.flip();
        while (buffer.hasRemaining()) {
            client.write(buffer);
        }

        //  重新监听OP_ACCEPT事件
        client.register(selector, SelectionKey.OP_READ);
    }
}
```

客户端代码：

```java
/**
 * @author 公众号：索码理(suncodernote)
 */
public class NIOClient {
    public static void main(String[] args) throws IOException {
        Selector selector = Selector.open();
        SocketChannel socketChannel = SocketChannel.open();
        socketChannel.configureBlocking(false);
        socketChannel.connect(new InetSocketAddress("localhost", 9999));
        socketChannel.register(selector, SelectionKey.OP_CONNECT);

        while (true) {
            selector.select();
            Set<SelectionKey> selectedKeys = selector.selectedKeys();
            Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

            while (keyIterator.hasNext()) {
                SelectionKey key = keyIterator.next();

                if (key.isConnectable()) {
                    SocketChannel client = (SocketChannel) key.channel();
                    if (client.isConnectionPending()) {
                        client.finishConnect();
                    }

                    System.out.print("Enter message to server: ");
                    Scanner scanner = new Scanner(System.in);
                    String message = scanner.nextLine();
                    ByteBuffer buffer = ByteBuffer.wrap(message.getBytes());
                    client.write(buffer);

                    client.register(selector, SelectionKey.OP_READ);
                } else if (key.isReadable()) {
                    SocketChannel client = (SocketChannel) key.channel();
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    client.read(buffer);
                    String output = new String(buffer.array()).trim();
                    System.out.println("来自客户端的消息: " + output);

                    System.out.print("输入消息: ");
                    // 和服务端代码一样
                    writeMessage(selector, client, buffer);
                }
                keyIterator.remove();
            }
        }
    }
}
运行结果：

server端
```shell
服务器已启动，等待客户端连接...
来自客户端 /127.0.0.1:57698 , 消息：1
来自客户端 /127.0.0.1:57698 , 消息：233
来自客户端 /127.0.0.1:57678 , 消息：333
来自客户端 /127.0.0.1:57678 , 消息：333
来自客户端 /127.0.0.1:57678 , 消息：333
```

客户端-1
```sh
Enter message to server: 333
来自客户端的消息: 333
输入消息: 333
来自客户端的消息: 333
输入消息: 333
来自客户端的消息: 333
输入消息: 
```

客户端-2

```shell
Enter message to server: 1
来自客户端的消息: 1
输入消息: 233
来自客户端的消息: 233
输入消息: 
```

上面代码新建了两个类：服务端（NIOServer）和客户端（NIOClient）， 通过上面代码和运行结果可以发现，在服务端和客户端进行通信时，我们并没有新建线程类进行通信，这也是 NIO 和 BIO 最大的区别之一。

需要注意的是，虽然NIO提高了系统的并发性能和伸缩性，但也带来了更高的编程复杂度和更难的调试问题。因此，在使用Java NIO时，需要仔细考虑其适用场景和编程模型。

## AIO

Java AIO（Asynchronous I/O）是Java提供的异步非阻塞IO编程模型，从Java 7版本开始支持，AIO又称NIO 2.0。

相比于NIO模型，AIO模型更进一步地实现了异步非阻塞IO，提高了系统的并发性能和伸缩性。在NIO模型中，虽然可以通过多路复用器处理多个连接请求，但仍需要在每个连接上进行读写操作，这仍然存在一定的阻塞。而在AIO模型中，所有的IO操作都是异步的，不会阻塞任何线程，可以更好地利用系统资源。

AIO模型有以下特性：

- **异步能力：** AIO模型的最大特性是异步能力，对于 socket 和 I/O 操作都有效。读写操作都是异步的，完成后会自动调用回调函数。
- **回调函数：** 在AIO模型中，当一个异步操作完成后，会通知相关线程进行后续处理，这种处理方式称为“回调”。回调函数可以由开发者自行定义，用于处理异步操作的结果。
- **非阻塞：** AIO模型实现了完全的异步非阻塞IO，不会阻塞任何线程，可以更好地利用系统资源。
- **高性能：** 由于AIO模型的异步能力和非阻塞特性，它可以更好地处理高并发、高伸缩性的网络通信场景，进一步提高系统的性能和效率。
- **操作系统支持：** AIO模型需要操作系统的支持，因此在不同的操作系统上可能会有不同的表现。在Linux内核2.6版本之后增加了对真正异步IO的实现。


### 优缺点

**优点：**

- **非阻塞：** AIO的主要优点是它是非阻塞的。这意味着在读写操作进行时，程序可以继续执行其他任务。这对于需要处理大量并发连接的高性能服务器来说是非常有用的。
- **高效：** 由于AIO可以处理大量并发连接，因此它通常比同步I/O（例如Java的传统I/O和NIO）更高效。
- **简化编程模型：** AIO使用了回调函数，这使得编程模型相对简单。当一个操作完成时，会自动调用回调函数，无需程序员手动检查和等待操作的完成。

**缺点：**

- **复杂性：** 虽然AIO的编程模型相对简单，但是由于其非阻塞的特性，编程复杂性可能会增加。例如，需要处理操作完成的通知，以及可能的并发问题。
- **资源消耗：** AIO可能会消耗更多的系统资源。因为每个操作都需要创建一个回调函数，如果并发连接数非常大，可能会消耗大量的系统资源。
- **可移植性：** AIO在某些平台上可能不可用或者性能不佳。因此，如果需要跨平台的可移植性，可能需要考虑使用其他I/O模型。

AIO适合一些极端的、超高频的、超长连接的通信场景，例如云计算、大数据等。

需要注意的是，目前AIO模型还没有广泛应用，Netty等网络框架仍然是基于 NIO 模型。

### 示例代码

服务端：
```
/**
 * @author 公众号：索码理(suncodernote)
 */
public class AIOServer {
    public static void main(String[] args) throws Exception {
        // 创建一个新的异步服务器套接字通道，绑定到指定的端口上
        final AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open().bind(new InetSocketAddress(5000));
        System.out.println("服务端启动成，等待客户端连接。");
        // 开始接受新的客户端连接
        serverChannel.accept(null, new CompletionHandler<AsynchronousSocketChannel, Void>() {
            @Override
            public void completed(AsynchronousSocketChannel clientChannel, Void att) {
                // 当一个新的连接完成时，再次接受新的客户端连接
                serverChannel.accept(null, this);

                // 创建一个新的缓冲区来读取数据
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                try {
                    InetSocketAddress clientAddress = (InetSocketAddress) clientChannel.getRemoteAddress();
                    InetAddress clientIP = clientAddress.getAddress();
                    int clientPort = clientAddress.getPort();
                    System.out.println("客户端 "+ clientIP + ":" + clientPort + " 连接成功。");
                } catch (IOException e) {
                    e.printStackTrace();
                }
                // 从异步套接字通道中读取数据
                clientChannel.read(buffer, buffer, new ReadCompletionHandler(clientChannel));
            }
            @Override
            public void failed(Throwable exc, Void attachment) {
                System.out.println("Failed to accept a connection");
            }
        });
        // 保持服务器开启
        Thread.sleep(Integer.MAX_VALUE);
    }
}
```

读处理程序：

```
/**
 * @author 公众号：索码理(suncodernote)
 */
public class ReadCompletionHandler implements CompletionHandler<Integer, ByteBuffer> {

    private AsynchronousSocketChannel channel;

    public ReadCompletionHandler(AsynchronousSocketChannel channel) {
        this.channel = channel;
    }

    @Override
    public void completed(Integer result, ByteBuffer attachment) {
        // 当读取完成时，反转缓冲区并打印出来
        attachment.flip();
        byte[] bytes = new byte[attachment.remaining()];
        attachment.get(bytes);
        System.out.println("收到的消息: " + new String(bytes , StandardCharsets.UTF_8));
        attachment.clear();

        // 从键盘读取输入
        Scanner scanner = new Scanner(System.in);
        System.out.print("输入消息: ");
        String message = scanner.nextLine();
        System.out.println();
        // 写入数据到异步套接字通道
        channel.write(ByteBuffer.wrap(message.getBytes()));

        channel.read(attachment , attachment , new ReadCompletionHandler(channel));
    }

    @Override
    public void failed(Throwable exc, ByteBuffer attachment) {
        System.out.println("Failed to read message");
    }
}
```

客户端：

```
/**
 * @author 公众号：索码理(suncodernote)
 */
public class AIOClient {
    public static void main(String[] args) throws Exception {
        // 创建一个新的异步套接字通道
        AsynchronousSocketChannel clientChannel = AsynchronousSocketChannel.open();

        // 连接到服务器
        clientChannel.connect(new InetSocketAddress("localhost", 5000), null, new CompletionHandler<Void, Void>() {
            @Override
            public void completed(Void result, Void attachment) {
                System.out.println("连接到服务端成功。");
            }
            @Override
            public void failed(Throwable exc, Void attachment) {
                System.out.println("Failed to connect server");
            }
        });
        
        // 从键盘读取输入
        Scanner scanner = new Scanner(System.in);
        System.out.print("发送消息: ");
        String message = scanner.nextLine();

        // 写入数据到异步套接字通道
        clientChannel.write(ByteBuffer.wrap(message.getBytes()), null, new CompletionHandler<Integer, Void>() {
            @Override
            public void completed(Integer result, Void attachment) {
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                clientChannel.read(buffer, buffer, new ReadCompletionHandler(clientChannel));
            }
            @Override
            public void failed(Throwable exc, Void attachment) {
                System.out.println("Failed to write message");
            }
        });

        // 保持客户端开启
        Thread.sleep(Integer.MAX_VALUE);
    }
}
```

上述示例代码中，通过一个服务端(AIOServer)和3个客户端(AIOClient)的通信，简单演示了AIO的使用。可以发现，AIO和NIO的使用方式基本一致，数据都是从Channel读入Buffer，或者从Buffer写入Channel中，不同的是AIO是实现了异步非阻塞。

## 总结

Java中的BIO、NIO和AIO都是处理输入/输出（I/O）操作的模型，但它们在处理方式和效率上有所不同。

- **BIO（Blocking I/O）：** BIO是最传统的I/O模型，它的操作都是阻塞的。这意味着，当一个线程发起一个I/O操作后，必须等待操作完成才能进行其他任务。因此，BIO在处理大量并发连接时效率较低，但其编程模型简单。

- **NIO（Non-blocking I/O）：** NIO是非阻塞的I/O模型，它允许线程在等待I/O操作完成时进行其他任务。NIO引入了Channel和Buffer的概念，以及Selector用于多路复用。NIO适合处理大量并发连接，但其编程模型相对复杂。

- **AIO（Asynchronous I/O）：** AIO是真正的异步I/O模型，应用程序无需等待I/O操作的完成，当操作完成时，操作系统会通知应用程序。AIO使用回调函数或Future对象来获取操作结果，适合处理大量并发连接，其编程模型相对简单。

总之，BIO、NIO和AIO各有优缺点，适用的场景也不同。BIO适合连接数目较少且固定的架构，NIO适合连接数目多，但是并发读写操作相对较少的场景，AIO则适合连接数目多，且并发读写操作也多的场景。在选择使用哪种I/O模型时，需要根据具体的应用场景和需求进行权衡。

## 参考

- [从理论到实践：深度解读BIO、NIO、AIO的优缺点及使用场景 -- 索码理](https://mp.weixin.qq.com/s/ITJlhJrY_IWB8KH1cEbE2w)
- [透过现象看Java AIO的本质 -- 得物技术](https://mp.weixin.qq.com/s/xl1kl2eF4cKWWsEvyeEWgg)
