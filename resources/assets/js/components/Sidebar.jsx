import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class Sidebar extends Component {
  render() {
    return (
      <div className="sidebar">
        <div className="sidebar-content-container flexbox flex-column flex-space-between">
          <a className="close" onClick={this.props.onCloseRequest}>
            <i className="fa fa-arrow-left"></i>
          </a>
          {this.props.children}
        </div>
      </div>
    )
  }
}

Sidebar.propTypes = {
  onCloseRequest: PropTypes.func
}

Sidebar.defaultProps = {
  onCloseRequest() {
  }
}
