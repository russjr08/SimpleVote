import React, { Component } from 'react'

import { Loader, Input, Container, Button, Divider, Header, Icon, Grid, Label } from 'semantic-ui-react'

import firestore from '../firebase'

class Voter extends Component {

    constructor(props) {
        super(props)

        this.IP_LOOKUP_URL = "http://api.ipapi.com/api/check?access_key=e8feb727d84195d56192675d9190356c&format=1"

        this.state = {loading: true, questionInput: "", mode: 1, voted: 0, options: {}}

        this.updateVotes = this.updateVotes.bind(this)
        this.setQuestion = this.setQuestion.bind(this)
        this.renderVoteOptions = this.renderVoteOptions.bind(this)
        this.registerVote = this.registerVote.bind(this)
        this.updateCurrentIP = this.updateCurrentIP.bind(this)
        this.hasVoted = this.hasVoted.bind(this)
        this.resetVoteData = this.resetVoteData.bind(this)
        this.renderEditorOptions = this.renderEditorOptions.bind(this)

        this.updateCurrentIP()
    }

    componentDidMount() {
        const sessionKey = this.props.match.params.sessionKey
        this.setState({sessionKey})

        firestore.collection("sessions").doc(sessionKey).onSnapshot(this.updateVotes)
    }

    updateVotes(doc) {
        const data = doc.data()
        console.log('Current vote data: ', data)

        if(data === undefined) {
            console.log('No vote data found')
            this.setState({loading: false, question: "", options: {}, voters: []})
            return
        }
        
        var options = {}
        if(data.opts !== undefined && data.opts.options !== undefined) {
            options = data.opts.options
        }

        var voters = []
        if(data.voters) {
            voters = data.voters
        }
        this.setState({loading: false, question: data.question, options: options, voters})
    }

    setQuestion() {
        firestore.collection("sessions").doc(this.state.sessionKey).set({question: this.state.questionInput}, { merge: true })
        this.setState({questionInput: ""})
    }

    setOption(option, value) {
        var options = this.state.options
        if(options[option] === undefined) {
            options[option] = {}
        }
        options[option] = { text: value, votes: options[option].votes || 0}
        firestore.collection("sessions").doc(this.state.sessionKey).set({opts: {options}}, { merge: true })
    }

    getOptionColor(choice) {
        if(this.state.voted) {
            if(this.state.voted === choice) {
                return 'red'
            }
        } else {
            return 'grey'
        }
    }

    updateCurrentIP(done) {
        fetch(this.IP_LOOKUP_URL)
        .then((res) => res.json())
        .then((json) => {
            this.setState({ip: json.ip})
            console.log("Current IP Address: " + json.ip)
            done(json.ip)
        })
    }

    render(){
        return (
            <div>
                <h1><em>{this.state.question}</em></h1>
                <Loader active={this.state.loading}>Loading</Loader>
                <br/>
                <br/>
                <Button.Group>
                    <Button positive={this.state.mode === 1} onClick={() => this.setState({mode: 1})}>Edit</Button>
                    <Button.Or />
                    <Button positive={this.state.mode === 2} onClick={() => this.setState({mode: 2})}>Vote</Button>
                </Button.Group>
                <br/>
                <br/>

                <Divider />
                <br/>

                <Container className={(this.state.mode !== 1 || this.state.loading ? 'hidden' : 'show')}>
                    <Input onChange={(e) => this.setState({questionInput: e.target.value})} action fluid size="huge" placeholder='Enter Question Here...'>
                        <input value={this.state.questionInput} />
                        <Button onClick={this.setQuestion} primary>Set</Button>
                    </Input>
                    <Divider horizontal>
                        <Header as='h4'>
                            <Icon name='bar chart' />
                            Vote Options
                        </Header>
                    </Divider>

                    <br/>
                    <br/>
                    <Grid>
                        {/* <Grid.Column width={4}><Grid.Row><Input onChange={(e) => this.setState(this.setOption(1, e.target.value))} label='Choice A' size="medium" /></Grid.Row></Grid.Column>
                        <Grid.Column width={4}><Grid.Row><Input onChange={(e) => this.setState(this.setOption(2, e.target.value))} label='Choice B' size="medium" /></Grid.Row></Grid.Column> 
                        <Grid.Column width={4}><Grid.Row><Input onChange={(e) => this.setState(this.setOption(3, e.target.value))} label='Choice C' size="medium" /></Grid.Row></Grid.Column> 
                        <Grid.Column width={4}><Grid.Row><Input onChange={(e) => this.setState(this.setOption(4, e.target.value))} label='Choice D' size="medium" /></Grid.Row></Grid.Column> */}
                        {this.renderEditorOptions()}
                    </Grid>

                    <br/>
                    <Divider />
                    <br/>

                    <Button negative onClick={this.resetVoteData}>Reset Votes</Button>

                    
                </Container>
                <Container className={(this.state.mode !== 2 || this.state.loading ? 'hidden' : 'show')}>
                <Grid centered>
                    {this.renderVoteOptions()}
                </Grid>
                    
                </Container>
            </div>
        )
    }

    hasVoted() {
        var voters = []
        if(this.state.voters !== undefined) {
            voters = this.state.voters
        }
        return this.state.voted !== 0 || voters.includes(this.state.ip)
    }

    resetVoteData() {
        firestore.collection("sessions").doc(this.state.sessionKey).delete()
    }

    registerVote(key) {
        this.setState({voted: key, loading: true})

        var opts = this.state.options
        opts[key].votes++

        this.setState({loading: false})
        var voters = this.state.voters
        if(!this.state.ip) {
            this.updateCurrentIP((ip) => {
                voters.push(ip)
                firestore.collection("sessions").doc(this.state.sessionKey).set({voters: voters, opts: {options: opts}}, {merge: true})
            })
            
        } else {
            voters.push(this.state.ip)
            firestore.collection("sessions").doc(this.state.sessionKey).set({voters: voters, opts: {options: opts}}, {merge: true})
        }
        

    }

    renderEditorOptions() {
        var elements = []

        for(var i = 0; i < 4; i++) {
            var optionText = ""
            if(this.state.options[i+1] !== undefined) {
                optionText = this.state.options[i+1].text
            }
            elements.push(
                <Grid.Column width={4}>
                    <Grid.Row>
                        <Input labelPosition='left' placeholder={`Enter Option`} size="medium">
                            <Label>{`Choice ${i+1}`}</Label>
                            <input value={optionText} data-key={i+1} onChange={(e) => {this.setOption(e.target.dataset.key, e.target.value)}}/>
                        </Input>
                    </Grid.Row>
                </Grid.Column>
            )
        }

        return elements
    }

    renderVoteOptions() {
        var elements = []
        
        for (var key in this.state.options) {
            console.log(key)
            elements.push(
                <Grid.Row key={key}>
                    <Button disabled={this.hasVoted()} data-key={key} onClick={(event) => {this.registerVote(event.currentTarget.dataset.key)}} as='div' labelPosition='right'>
                        <Button color={this.getOptionColor(key)}>
                            <Icon name='heart' />
                            {this.state.options[key].text}
                        </Button>
                        <Label as='a' basic color={this.getOptionColor(key)} pointing='left'>
                            {this.state.options[key].votes}
                        </Label>
                    </Button>
                </Grid.Row>
            )
        }

        if(Object.keys(this.state.options).length === 0) {
            elements.push(
                <Grid.Row><h3>There's nothing here to vote on yet!</h3></Grid.Row>
            )
        }

        return elements
    }

}

export default Voter