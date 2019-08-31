const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })
const users = {};

const sendTo = (ws, message) => {
  ws.send(JSON.stringify(message))
}

wss.on('connection', ws => {
  console.log('User connected')
  // sendTo(ws, { type: 'login', success: false })
  ws.on('message', message => {
    let data = null

    try {
      data = JSON.parse(message)
    } catch (error) {
      console.error('Invalid JSON', error)
      data = {}
    }

    switch (data.type) {
      case 'login':
        console.log('User logged', data.username)
        if (users[data.username]) {
          sendTo(ws, { type: 'login', success: false })
        } else {
          users[data.username] = ws
          ws.username = data.username
          sendTo(ws, { type: 'login', success: true })
        }
        break
      case 'offer':
        console.log('Sending offer to: ', data.otherUsername)
        if (users[data.otherUsername] != null) {
          ws.otherUsername = data.otherUsername
          sendTo(users[data.otherUsername], {
            type: 'offer',
            offer: data.offer,
            username: ws.username
          })
        }
        break
      case 'answer':
        console.log('Sending answer to: ', data.otherUsername)
        if (users[data.otherUsername] != null) {
          ws.otherUsername = data.otherUsername
          sendTo(users[data.otherUsername], {
            type: 'answer',
            answer: data.answer
          })
        }
        break
      case 'candidate':
        console.log('Sending candidate to:', data.otherUsername)
        if (users[data.otherUsername] != null) {
          sendTo(users[data.otherUsername], {
            type: 'candidate',
            candidate: data.candidate
          })
        }
        break
      case 'close':
        console.log('Disconnecting from', data.otherUsername)
        users[data.otherUsername].otherUsername = null

        if (users[data.otherUsername] != null) {
          sendTo(users[data.otherUsername], { type: 'close' })
        }

        break

      default:
        sendTo(ws, {
          type: 'error',
          message: 'Command not found: ' + data.type
        })

        break
    }
  })

  ws.on('close', () => {
    if (ws.username) {
      delete users[ws.username]

      if (ws.otherUsername) {
        console.log('Disconnecting from ', ws.otherUsername)
        users[ws.otherUsername].otherUsername = null

        if (users[ws.otherUsername] != null) {
          sendTo(users[ws.otherUsername], { type: 'close' })
        }
      }
    }
  })
})
git reset --hard
git checkout dev
$("ion-content").css({left:this.platform.width()}).animate({"left":"0px"}, "slow");
imranulhasan73@gmail.com
pa55w0rd() Baal_007 &
javaProgramming007
javaprogramming007
#|| !==
172.168.16.1


1 vid :11407, 12292,93,94,95

2 vid:11878,11876,11879

01748620950


https://vlab(7).trainocate.com


01632221377

flutter config --android-sdk D:\SOFTWARE_2\Android_Software_SDK\android-sdk
classpath 'com.android.tools.build:gradle:3.4.1'


        ListView.builder(
          itemCount: users.length,
          itemBuilder: (context, index) {

            return Row(
              children: <Widget>[
                Container(
                  width: MediaQuery.of(context).size.width,
                  height:200,
                  child:Image.network(users[index].name)
                )
              ],
            );
          },
        ));



Scaffold(
      appBar: AppBar(title: Text(title)),
      body: 
      OrientationBuilder(
        builder: (context, orientation) {
          return GridView.count(
            // Create a grid with 2 columns in portrait mode, or 3 columns in
            // landscape mode.
            crossAxisCount: orientation == Orientation.portrait ? 2 : 3,
            // Generate 100 widgets that display their index in the List.
            children: List.generate(100, (index) {
              return Center(
                child: Text(
                  'Item $index',
                  style: Theme.of(context).textTheme.headline,
                ),
              );
            }),
          );
        },
      ),
    );














import 'dart:convert';
import 'package:flutter/material.dart';

import 'dart:async';
import 'package:http/http.dart' as http;

const baseUrl = "https://jsonplaceholder.typicode.com";

class API {
  static Future getUsers() {
    var url = baseUrl + "/photos";
    return http.get(url);
  }
}

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  build(context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'My Http App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyListScreen(),
    );
  }
}

class MyListScreen extends StatefulWidget {
  @override
  createState() => _MyListScreenState();
}

class _MyListScreenState extends State {
  var users = new List<User>();

  _getUsers() {
    API.getUsers().then((response) {
      setState(() {
        Iterable list = json.decode(response.body);
        JsonEncoder encoder = new JsonEncoder.withIndent('  ');
        String prettyprint = encoder.convert(list);
        print(prettyprint);

        users = list.map((model) => User.fromJson(model)).toList();
      });
    });
  }

  initState() {
    super.initState();
    _getUsers();
  }

  dispose() {
    super.dispose();
  }

  @override
  build(context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("User List"),
        ),
        body:      OrientationBuilder(
          builder: (context, orientation) {
            return GridView.count(
              // Create a grid with 2 columns in portrait mode, or 3 columns in
              // landscape mode.
              crossAxisCount: orientation == Orientation.portrait ? 2 : 3,
              // Generate 100 widgets that display their index in the List.
              children: List.generate(users.length, (index) {
                return Container(
                  width: 200,
                  height:200,
                  child: Image.network(users[index].name)
                );
              }),
            );
          },
        ),
    );

  }
}


class User {
  int id;
  String name;
  String email;



  User.fromJson(Map json)
      :name = json['url'];



}


https://play.voxzer.org/watch?v=gAAAAABdX3QhLvQQcKSVcWriwXTGI7fMc_6B4Q5f49VH-mwcGH6quIluKMR_jV-t7opT0tTC5YmlyZjvQT1cs81eEU0OGwHu5kw14SPUCEw6JSTdGvDl9gfyvxb0srJI1SOR78e6iEo0cHkcIb4KNKotZj6G1x7plw==


https://embed.streamx.live?k=76a6a59217675bf65a6efaf2e67f396f3a3c66df8039441db7388d945f7a1980&amp;li=0&amp;tham=1566537067&amp;lt=vserver&amp;st=5b59af664b9f90b4d00f73cc3916bb6692b1ebd3f8cf22e31b04fb1d6adcf4e06f89bcb7e867ba0ddcc6600df7e3d5c19e0a6f1bb9677de0a825fb68ca70bc4700b55453e5a971cdc0be818ce589684265074b6ab18a992f7889cebbb435110b32529a7f005e60a0f73ee9fcc94c3c0e370edb1bb9f80b4d5643bde86f2dc9fd&amp;qlt=720p&amp;spq=p&amp;prv=&amp;key=18424a97f0ca04ad4436fc5da7366873&amp;ua=de1bb6a25fc8916d6c022705e7b454c4ec3f1a4bd67ae81b5ea026878e4df69e202210c76cc98fb675c640c6f8ac1506cc0f3fe01b8a60d492a94930face1e4cda166f0d3dede5a577fd786a11c19a7f7318aab277906a113795eaf1507bf6dccee73c13389c1e9d35df74c3bb4d4f16f445094b40dffbe23a36b80d022a7b14&amp




  