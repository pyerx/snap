import React, {Component} from 'react'
import AccountView from '../components/AccountView'
import moment from 'moment'
import Scene from './Scene'

export default class AccountScene extends Scene {
  constructor(props) {
    super(props)

    this.state = {
      name                     : '',
      units                    : '',
      email                    : '',
      is_anonymous             : 0,
      birth_year               : '',
      errors                   : {
        name        : [],
        email       : [],
        is_anonymous: [],
        birth_year  : [],
        units       : []
      },
      message                  : '',
      new_password             : '',
      old_password             : '',
      new_password_confirmation: '',
      password_errors          : [],
      password_message         : '',
      provider                 : '',
      has_password             : true
    }

    document.title = 'User Account'
  }

  /**
   * Get the user record from the server.
   */
  componentDidMount() {
    axios.get('/web/user').then(response => {
      let user = response.data.data
      this.setState({
        name        : user.name,
        units       : user.units,
        email       : user.email,
        is_anonymous: user.is_anonymous ? 1 : 0,
        birth_year  : user.birth_year,
        provider    : user.provider,
        has_password: user.has_password
      })

      window.fixHeight()
    }).catch(error => {
      console.log(error)
    })
  }

  /**
   * Submit personal info form.
   *
   * @param e Event
   */
  submit(e) {
    e.preventDefault()

    axios.put('/web/user', {
      name        : this.state.name,
      email       : this.state.email,
      is_anonymous: this.state.is_anonymous,
      birth_year  : this.state.birth_year,
      units       : this.state.units
    }).then(response => {
      let user = response.data.data

      this.setState({
        name        : user.name,
        email       : user.email,
        units       : user.units,
        is_anonymous: user.is_anonymous ? 1 : 0,
        message     : 'Account updated successfully',
        errors      : {
          name        : [],
          email       : [],
          is_anonymous: [],
          birth_year  : [],
          units       : []
        }
      })

      window.TreeSnap.units = user.units
    }).catch(error => {
      if (error.response && error.response.status === 422) {
        let errors = error.response.data
        this.setState({
          message: '',
          errors : {
            name        : errors.name || [],
            email       : errors.email || [],
            is_anonymous: errors.is_anonymous || [],
            birth_year  : errors.birth_year || []
          }
        })
      }
    })
  }

  /**
   * Submit password form.
   *
   * @param e Event
   */
  submitPassword(e) {
    e.preventDefault()

    axios.patch('/web/user/password', {
      new_password             : this.state.new_password,
      new_password_confirmation: this.state.new_password_confirmation,
      old_password             : this.state.old_password
    }).then(response => {
      this.setState({
        password_message         : response.data.data,
        password_errors          : [],
        new_password             : '',
        new_password_confirmation: '',
        old_password             : ''
      })
    }).catch(error => {
      if (error.response && error.response.status === 422) {
        let errors          = error.response.data
        let password_errors = []
        // flatten errors
        Object.keys(errors).map(key => {
          errors[key].map(e => password_errors.push(e))
        })
        this.setState({password_errors, password_message: ''})
      }
    })
  }

  /**
   * Render password errors.
   *
   * @returns {XML}
   */
  renderPasswordErrors() {
    if (this.state.password_errors.length === 0) {
      return
    }

    return (
      <div className="alert is-danger">
        {this.state.password_errors.map((error, index) => {
          return <p key={index}>{error}</p>
        })}
      </div>
    )
  }

  renderPasswordForm() {
    return (
      <div className="box">
        <h1 className="title is-4">Change Password</h1>
        <form action="#" method="post" onSubmit={this.submitPassword.bind(this)}>
          {this.renderPasswordErrors()}

          {this.state.password_message !== '' ?
            <div className="alert is-success">
              {this.state.password_message}
            </div>
            : null}

          <div className="field limit-width">
            <label className="label">Old Password</label>
            <div className="control">
              <input type="password"
                     className="input"
                     placeholder="Old password"
                     value={this.state.old_password}
                     onChange={e => this.setState({old_password: e.target.value})}/>
            </div>
          </div>

          <div className="field limit-width">
            <label className="label">New Password</label>
            <div className="control">
              <input type="password"
                     className="input"
                     placeholder="New password"
                     value={this.state.new_password}
                     onChange={e => this.setState({new_password: e.target.value})}/>
            </div>
          </div>

          <div className="field limit-width">
            <label className="label">Repeat Password</label>
            <div className="control">
              <input type="password"
                     className="input"
                     placeholder="Repeat new password"
                     value={this.state.new_password_confirmation}
                     onChange={e => this.setState({new_password_confirmation: e.target.value})}/>
            </div>
          </div>

          <div className="field mt-1">
            <div className="control">
              <button type="submit"
                      className="button is-primary">
                Update Password
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  submitNewPassword(e) {
    e.preventDefault()

    axios.post('/web/user/create-password', {
      password             : this.state.new_password,
      password_confirmation: this.state.new_password_confirmation
    }).then(response => {
      this.setState({
        has_password             : true,
        password_message         : 'Password created successfully. You may now login using your email and new password.',
        new_password             : '',
        new_password_confirmation: ''
      })
    }).catch(e => {
      if (e.response && e.response.status === 422) {
        this.setState({
          password_errors: e.response.data.password
        })
      }

      console.log(e)
    })
  }

  renderCreatePasswordForm() {
    return (
      <div className="box">
        <h1 className="title is-4 mb-1">Create Password</h1>
        <form action="#" method="post" onSubmit={this.submitNewPassword.bind(this)}>
          {this.renderPasswordErrors()}

          {this.state.password_message !== '' ?
            <div className="alert is-success">
              {this.state.password_message}
            </div>
            : null}

          <div className={'alert is-warning mb-1'}>
            You are logged in using your {this.state.provider} account and have not yet set up a password with TreeSnap.
            <br/>
            Setting up a password with TreeSnap allows you to login without using third party services such as {this.state.provider}.
          </div>

          <div className="field limit-width">
            <label className="label">Password</label>
            <div className="control">
              <input type="password"
                     className="input"
                     placeholder="New password"
                     value={this.state.new_password}
                     onChange={e => this.setState({new_password: e.target.value})}/>
            </div>
          </div>

          <div className="field limit-width">
            <label className="label">Repeat Password</label>
            <div className="control">
              <input type="password"
                     className="input"
                     placeholder="Repeat new password"
                     value={this.state.new_password_confirmation}
                     onChange={e => this.setState({new_password_confirmation: e.target.value})}/>
            </div>
          </div>

          <div className="field mt-1">
            <div className="control">
              <button type="submit"
                      className="button is-primary">
                Save Password
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  /**
   * Generate birth years.
   * @returns {Array}
   * @private
   */
  _generateBirthDateOptions() {
    let today = parseInt(moment().format('YYYY').toString())
    let dates = []
    for (let i = today; i > today - 101; i--) {
      dates.push(i)
    }
    return dates.map((v, i) => {
      return (<option key={i} value={v}>{v}</option>)
    })
  }

  /**
   * render.
   *
   * @returns {XML}
   */
  render() {
    return (
      <AccountView>
        <h3 className="title is-3">Settings</h3>
        <div className="box">
          <h1 className="title is-4">Personal Information</h1>

          {this.state.message !== '' ?
            <div className="alert is-success">
              {this.state.message}
            </div>
            : null
          }

          <form action="#"
                method="post"
                onSubmit={this.submit.bind(this)}>

            <div className="field limit-width">
              <label className="label">Name</label>
              <div className="control">
                <input type="text"
                       className={`input${this.state.errors.name.length > 0 ? ' is-danger' : ''}`}
                       value={this.state.name}
                       onChange={e => this.setState({name: e.target.value})}/>
                {this.state.errors.name.map((error, index) => {
                  return <p className="help is-danger" key={index}>{error}</p>
                })}
              </div>
            </div>

            <div className="field limit-width">
              <label className="label">Email</label>
              <div className="control">
                <input type="email"
                       className={`input${this.state.errors.email.length > 0 ? ' is-danger' : ''}`}
                       value={this.state.email}
                       onChange={e => this.setState({email: e.target.value})}/>
                {this.state.errors.email.map((error, index) => {
                  return <p className="help is-danger" key={index}>{error}</p>
                })}
              </div>
            </div>

            <div className="field">
              <label className="label">Year of Birth</label>
              <div className={`select${this.state.errors.birth_year.length > 0 ? ' is-danger' : ''}`}>
                <select type="text"
                        className="input"
                        value={this.state.birth_year}
                        onChange={(e) => this.setState({birth_year: e.target.value})}
                >
                  {this._generateBirthDateOptions()}
                </select>
              </div>
              {this.state.errors.birth_year.map((error, index) => {
                return <p className="help is-danger" key={index}>{error}</p>
              })}
            </div>

            <div className="field">
              <label className="label">Anonymous</label>
              <div className="control">
                <span
                  className={`select${this.state.errors.is_anonymous.length > 0 ? ' is-danger' : ''}`}>
                  <select value={this.state.is_anonymous}
                          onChange={e => this.setState({is_anonymous: e.target.value})}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </span>
                {this.state.errors.is_anonymous.map((error, index) => {
                  return <p className="help is-danger" key={index}>{error}</p>
                })}
                <p className="help">Anonymous users have their information hidden from other users.</p>
              </div>
            </div>

            <div className="field">
              <label className="label">Measurement Units</label>
              <div className="control">
                <span
                  className={`select${this.state.errors.units.length > 0 ? ' is-danger' : ''}`}>
                  <select value={this.state.units}
                          onChange={e => this.setState({units: e.target.value})}>
                    <option value="US">US (Foot, Inches)</option>
                    <option value="metric">Metric (Centimeters, Meters)</option>
                  </select>
                </span>
                {this.state.errors.units.map((error, index) => {
                  return <p className="help is-danger" key={index}>{error}</p>
                })}
              </div>
            </div>

            <div className="field mt-1">
              <div className="control">
                <button type="submit" className="button is-primary">Update</button>
              </div>
            </div>
          </form>
        </div>

        {this.state.has_password ? this.renderPasswordForm() : this.renderCreatePasswordForm()}
      </AccountView>
    )
  }
}
