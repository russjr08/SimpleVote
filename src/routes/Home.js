import React, { Component } from 'react';
import { Input, Button } from 'semantic-ui-react'

class Home extends Component {

    constructor(props) {
        super(props)

        this.state = { sessionKey: ""}

        this.startSession = this.startSession.bind(this)
    }

    render() {
        return (
            <div>
                <h1>Welcome to Simple Vote!</h1>
                <h3>To get started, enter a Session Key below. Everyone in your group needs to use the same Session Key.</h3>

                <br/>
                <Input type="text" onChange={(e) => { this.setState({sessionKey: e.target.value}) }} action placeholder='Session Key'>
                    <input/>
                    <Button type="submit" onClick={this.startSession}>Start!</Button>
                </Input>
            </div>
        )
    }

    startSession() {
        console.log(`Starting session with ID: ${this.state.sessionKey}`)
        this.props.history.push(`/session/${this.state.sessionKey}`)
    }

}

export default Home;