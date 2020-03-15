var idUser=$('#idUser').val();
var imgUser=$('#imgUser').val();
var nameUser=$('#nameUser').val();
var currentChat=[];
var selectedFriend;
var friendList=[];

var loadData =async function (url,data,callback)
{
  var requestInfo={
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
    timeout:0
  };
  var response = await fetch(url,requestInfo);
  var responseJson =await response.json();
  callback(responseJson);
}

class FriendList extends React.Component {
  constructor(props) {
    super(props);
    this.state ={friends: []};
  }

  componentDidMount(){
    if(friendList.length==0){
      loadData("/api/getdatajoin?iduser="+idUser,{localfield:"idfriend",foreignfield:"_id",coll1:"friends",coll2:"users",filter:{iduser:idUser}},(res)=>{ 
        this.setState({friends: res});
        friendList=res;
      });
    }
    else
    {
      this.setState({friends: this.props.friends});
    }
  }
  render() {
    if(this.props.searchfriend!=undefined)
    {
      this.state.friends =this.props.searchfriend;
    }
    if(this.state.friends !==undefined && this.state.friends.length>0){
      return this.state.friends.map((friend)=>{
        return (
          <li class="" onClick={(ele)=>
          {
            $(ele.target).closest('ui').find('li').removeClass("active");
            $(ele.target).closest('li').attr('class','active');
            var filter={ $or :[{$and: [ { sender: friend.data._id }, { receiver:idUser } ]} , {$and: [ { sender: idUser }, { receiver: friend.data._id} ]}] };
            
            loadData("/api/findMany",{coll:"chats",filter:filter,sort:{time:1}},(res)=>{
              ReactDOM.render(<DetailChat friend={friend} chats={res} />, document.querySelector('#detailChat'));
              currentChat=res;selectedFriend=friend;
            });
          }}>
            <div class="d-flex bd-highlight" style={{"cursor":"pointer","marginRight" : '10px',"overflow" : 'hidden'}}>
                <div class="img_cont">
                    <img style={{maxWidth:"423px",maxheight:"423px"}} src={friend.data==undefined? "": friend.data.profile.foto} class="rounded-circle user_img"></img>
                    <span class="online_icon"></span>
                </div>
                <div class="user_info">
                    <span><b>{friend.data==undefined? "": friend.data.profile.firstname} {friend.data==undefined? "": friend.data.profile.lastname}</b></span>
                    <p>{friend.data==undefined? "": friend.data.profile.phone}</p>
                </div>
            </div>
          </li>
        )
      });
    }
    else
    {
      return (
        <li class="" style={{"border": "0.5px solid gray","borderRadius": "25px"}}>
          <div class="d-flex bd-highlight">
              <div class="img_cont">
                  <img src="\images\guest.png" class="rounded-circle user_img"></img>
                  <span class="online_icon"></span>
              </div>
              <div class="user_info">
                  <span>Loading...</span>
                  <p>Loading friend list..</p>
              </div>
          </div>
        </li>
      )
    }
  }
}

var txtMessage;
class DetailChat extends React.Component {
  constructor(props) {
    super(props);
    this.state ={friend: [],chats:[]};
  }
  componentDidMount(){

  }
  sendMessage(receiver){
    var message={"sender" : idUser,"receiver" : receiver,"file" : "","message" : txtMessage,time:new Date().toString()};
    currentChat.push(message);
    
    ReactDOM.render(<Chats friend={selectedFriend} chats={currentChat}/>, document.querySelector('#chats'));
    loadData("/api/insertOne",{coll:"chats",document:message,receiver:receiver,sender:idUser},(res)=>{});
  }
  render() {
    if(this.props.friend != undefined)
    { 
      var friend=this.props.friend;
      if(nameUser=="Demo")
      {
        return (<div class="card">
            <div class="card-header msg_head" style={{"backgroundColor":"#6595f0"}}>
            <center>DETAIL CONTACT</center>
            </div>
            <div class="card-body msg_card_body">
              <div style={{marginTop:"20px",marginBottom:"20px"}}><center>
                <img src={friend.data.profile.foto!=""?friend.data.profile.foto : "/images/guest.png"} style={{height :'200px','width' : '200px'}}></img>
              </center>
              </div>
              <div>
                <p style={{border:"1px solid"}}>{friend.data.profile.firstname} {friend.data.profile.lastname}</p>
                <p style={{border:"1px solid"}}>{friend.data.profile.phone}</p>
                <p style={{border:"1px solid"}}>{friend.data.profile.address}</p>
              </div>
            </div>
          </div>)
      }
      else
      {
        return (
          <div class="card">
            <div class="card-header msg_head">
                <div class="d-flex bd-highlight">
                  <div class="img_cont">
                      <img src={friend.data.profile.foto!=""?friend.data.profile.foto : "/images/guest.png"} class="rounded-circle user_img"></img>
                      <span class="online_icon"></span>
                  </div>
                  <div class="user_info">
                      <span>Chat with {friend.data.profile.firstname} {friend.data.profile.lastname}</span>
                      <p>{this.state.chats.length} Messages</p>
                  </div>
                  <div class="video_cam">
                      <span><i class="fas fa-video"></i></span>
                      <span><i class="fas fa-phone"></i></span>
                  </div>
                </div>
                <span id="action_menu_btn"><i class="fas fa-ellipsis-v"></i></span>
                <div class="action_menu">
                    <ul>
                      <li><i class="fas fa-user-circle"></i> View profile</li>
                      <li><i class="fas fa-users"></i> Add to close friends</li>
                      <li><i class="fas fa-plus"></i> Add to group</li>
                      <li><i class="fas fa-ban"></i> Block</li>
                    </ul>
                </div>
            </div>
            <div id="chats" class="card-body msg_card_body">
              <Chats friend={friend} chats={this.props.chats}/>
            </div>
            <div class="card-footer">
                <div class="input-group">
                  <div class="input-group-append">
                      <span class="input-group-text attach_btn"><i class="fas fa-paperclip"></i></span>
                  </div>
                  <textarea id="txtMessage" class="form-control type_msg" placeholder="Type your message..." onKeyUp={(e)=>{
                    txtMessage=$(e.target).val();
                  }}>
                  </textarea>
                  <div class="input-group-append" onClick={()=>{
                      this.sendMessage(friend.data._id);
                      $("#txtMessage").val("");
                  }}>
                      <span class="input-group-text send_btn"><i class="fas fa-location-arrow"></i></span>
                  </div>
                </div>
            </div>
          </div>
        );
      }
      
    }
    else
    return (
      <div class="card"></div>
    );
  }
}
class Chats extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount(){
  }
  render() {
    return (
      this.props.chats.map((val,i)=>{
        { 
        return val.sender!=idUser ? (
          <div class="d-flex justify-content-end mb-4">
              <div class="msg_cotainer_send">
                  {val.message}
                  <span class="msg_time_send" style={{minWidth:"105px"}}>{new Date(val.time).getDate()}-{new Date(val.time).getMonth()+1}-{new Date(val.time).getFullYear()}  {new Date(val.time).toLocaleTimeString()}</span>
              </div>
              <div class="img_cont_msg">
                <img src={imgUser !=""? imgUser : "/images/guest.png"} style={{maxWidth:"40px",maxHeight:"40px"}} class="rounded-circle user_img_msg"></img>
              </div>
          </div>
        ) : 

        (
          <div class="d-flex justify-content-start mb-4">
              <div class="img_cont_msg">
                  <img src={this.props.friend.data.profile.foto !=""? this.props.friend.data.profile.foto : "/images/guest.png"} style={{maxWidth:"40px",maxHeight:"40px"}} class="rounded-circle user_img_msg"></img>
              </div>
              <div class="msg_cotainer">
                  {val.message}
                  <span class="msg_time" style={{width:"150px"}}>{new Date(val.time).getDate()}-{new Date(val.time).getMonth()+1}-{new Date(val.time).getFullYear()}  {new Date(val.time).toLocaleTimeString()}</span>
              </div>
          </div>

        )}
      })
    )
  }
}
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state={searchfriend:[]};
  }
  componentDidMount(){
  }
  render() {
    return (
      <div class="input-group">
          <input id="txtsearch" type="text" onKeyUp={(e)=>{
            this.state.searchfriend=[];
            var textSearch=$(e.target).val();
            friendList.map((val,i)=>{
              if(val.data.username.includes(textSearch) || val.data.profile.phone.includes(textSearch) || val.data.profile.firstname.includes(textSearch) || val.data.profile.lastname.includes(textSearch))
              {this.state.searchfriend.push(val);}
            });
            ReactDOM.render(<FriendList searchfriend={this.state.searchfriend}/>, document.querySelector('#friendlist'));
            ReactDOM.render(<DetailChat/>, document.querySelector('#detailChat'));
          }} placeholder="Search..." name="" class="form-control search"></input>
          <div class="input-group-prepend">
              <span class="input-group-text search_btn"><i class="fas fa-search"></i></span>
          </div>
      </div>
    )
  }
}
ReactDOM.render(<DetailChat/>, document.querySelector('#detailChat'));
ReactDOM.render(<FriendList/>, document.querySelector('#friendlist'));
ReactDOM.render(<Search/>, document.querySelector('#cardheader'));

var messaging=firebase.messaging();
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    messaging.getToken().then((currentToken) => {
      console.log(currentToken);

      loadData("/api/findOne",{filter:{"_id":idUser},coll:"users"},(res)=>{
        if(res)
        {
          if(res.token.web!=currentToken || res.token.web==undefined)
          {loadData("/api/updateuser",{filter:{_id:idUser},data:{"token":{web:currentToken}}},(res)=>{console.log("Token updated")})}
        }
      })
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });

  } else {
    alert("Please turn on Notification feature in your browser")
  }
});

messaging.onMessage((res) => {
  if(selectedFriend){
    if(res.data.receiver==selectedFriend.iduser)
    {
      currentChat.push(res.data);console.log("Terima")
      ReactDOM.render(<Chats friend={selectedFriend} chats={currentChat}/>, document.querySelector('#chats'));
    }
  }
});