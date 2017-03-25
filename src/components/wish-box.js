import React from 'react';
import jQuery from 'jquery';

import WishForm from './wish-form';
import LoginForm from './login-form'
import Wish from './wish';
import cookie from 'react-cookie';

import SocketIOClient from 'socket.io-client';

import {API_CONFIG_URLs} from '../config/API_Urls';

// Creating the socket-client instance will automatically connect to the server.
const socket = SocketIOClient(API_CONFIG_URLs.socketIO);

export default class WishBox extends React.Component {

  constructor() {
    super();

    const loginTpl = (
      <div className="row wishes-container">
        <div className="cell">
          <h2>Sign In</h2>
          <div className="wish-box">
            <LoginForm login={this._login.bind(this)}/>
          </div>
        </div>
      </div>
    );

    this.state = {
      wishesList: [],
      loginForm: loginTpl,
      loggedIn: false
    };

  }

  componentWillMount() {
    this._fetchWishes();
  }

  componentDidMount() {
    socket.on('new wish', (data) => {
        const wishAdded = {
          wish_id: data.id,
          wish: data.wish,
          created_at: data.created_at
        };

        this.state.wishesList.unshift(wishAdded);

        this.setState({
          wishesList: this.state.wishesList
        });
      }
    );

  }

  render() {
    const wishesList = this._getWishes();

    const wishForm = (
      <div className="row wishes-container">
        <div className="cell">
          <h2>Wish list management</h2>
          <div className="wish-box">
            <WishForm addWish={this._addWish.bind(this)}/>

            <h3 className="wish-count">{this._getWishesTitle(wishesList.length)}</h3>
            <div className="wish-list">
              {wishesList}
            </div>
          </div>
        </div>
      </div>
    );

    return (!cookie.load('loggedIn') ? this.state.loginForm : wishForm);
  }

  _getWishes() {
    return this.state.wishesList.map((wish) => {
      return <Wish
        {...wish}
        key={wish.wish_id}/>
    });
  }

  _getWishesTitle(wishCount) {
    if (wishCount === 0) {
      return 'No wishes yet';
    } else if (wishCount === 1) {
      return '1 wish';
    } else {
      return `${wishCount} wishes`;
    }
  }

  _addWish(wish) {

    if (!wish) {
      return;
    }

    jQuery.ajax({
      method: 'POST',
      url: this._getURL(API_CONFIG_URLs.new_wish),
      data: {wish: wish},
      success: () => {
        //Handled by socket.io
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  _login(email, password) {

    if (!email || !password) {
      return;
    }

    jQuery.ajax({
      method: 'POST',
      url: this._getURL(API_CONFIG_URLs.login),
      data: {email: email, password: password},
      success: (resp) => {
        if (resp.User.length) {
          alert(JSON.stringify(resp.User));
          cookie.save('loggedIn', true);
          this.setState({loggedIn: true});
        }
        else {
          alert('Login ou mot de passe incorrect.');
        }
      }
    });
  }

  _getURL(serviceName) {
    return API_CONFIG_URLs.apiPathBase + serviceName;
  }

  _fetchWishes() {
    jQuery.ajax({
      method: 'GET',
      url: this._getURL(API_CONFIG_URLs.wishesList),
      success: (wishes) => {
        const wishesList = wishes.wishes;

        wishesList.sort(function (a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        this.setState({wishesList});
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
