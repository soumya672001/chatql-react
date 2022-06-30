import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import { Authenticator } from 'aws-amplify-react';
import { createUser } from '../../mutationHelper';
import { getUser } from '../../queryHelper';
import awsExports from '../../aws-exports';
import logo from '../../assets/img/chat.png';
import Induslogo from '../../assets/img/IndusFoods.png';
import './Home.css';

const authErrorMessageMapper = (message) => {
    if (/incorrect.*username.*password/i.test(message)) {
        return 'Incorrect username or password';
    }
    console.log("ERROR: " + message);
    return message;
}

class Home extends Component {

    render() {
        return (
            <div className="container home">
                <div className="card bg-light">
                    {/* <img className="card-img-top" src={logo} alt="Exchanging Ideas" /> */}
                    <div className="card-body">
                        <h1 className="card-title display-4 text-center">Indusfoods Chat</h1>
                        <p className="card-body border border-right-0 border-left-0 text-center p-1"> Agent interface for whatsapp business chat </p>
                        <Authenticator
                            onStateChange={this.handleAuthStateChange}  
                            amplifyConfig={awsExports}
                            errorMessage={authErrorMessageMapper}
                        />
                    </div>
                    <div className="bg-light">
                        <a href="https://aws.amazon.com/appsync" target="_blank">
                            <img className="img-fluid img-responsive mx-auto d-block appsync" src={Induslogo} alt="Indusfoods" />
                        </a>
                        <br/>
                    </div>
                </div>
            </div>
        );
    }

    handleAuthStateChange = async (state) => {
        if (state === 'signedIn') {
            const cognitoUser = await Auth.currentAuthenticatedUser();
            const userExists = await getUser(cognitoUser.username);
            if (!userExists) {
                const createdUser = await createUser({id: cognitoUser.username, username: cognitoUser.username });
                this.props.onLogin(cognitoUser);
            } else {
                this.props.onLogin(cognitoUser);
            }
        }
    }
}

export default Home;
