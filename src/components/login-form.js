import React from 'react';

export default class LoginForm extends React.Component {
  constructor() {
    super();

    this.state = {}
  }

  render() {
    return (
      <form className="login-form" onSubmit={this._handleLogin.bind(this)}>
        <div className="login-form-fields">
          <input type="email" name="email" placeholder="Username:" ref={c => this._email = c}/>
          <input type="password" name="password" placeholder="Password:" ref={c => this._password = c}/>
        </div>
        <div className="login-form-actions">
          <button type="submit">
            Login
          </button>
        </div>
      </form>
    );
  }

  _handleLogin(event) {
    event.preventDefault();

    this.props.login(this._email.value, this._password.value);

  }
}
