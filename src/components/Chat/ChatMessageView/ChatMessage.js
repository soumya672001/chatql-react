import React, { Component } from 'react';
import * as AWS from 'aws-sdk';
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import awsExports from '../../../aws-exports';

const userAccessToken = process.env.REACT_APP_META_TOKEN;

class ChatMessage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            text: null,
            imgUrl: null
        }
    }
    
    componentDidMount = () => {
    	console.log("in componentmount")
    	this.checkJson(this.props.message.content)
            
    } 
    
    componentWillUnmount() {
		var urlCreator = window.URL || window.webkitURL;    
		urlCreator.revokeObjectURL(this.state.imgUrl);
	}   
    
    render() {
        const timeString = this.props.message.createdAt ?
            new Date(this.props.message.createdAt).toLocaleTimeString() :
            new Date().toLocaleTimeString();
        console.log("state: ", this.state)
        return (
            <div className={this.messageClassNames()}>
                {this.state.imgUrl ? (<img class="card-img-top" src={this.state.imgUrl} alt="Card image cap" ></img>) : null}            
                <div className="card-body p-2 border rounded">
                <div className='clearfix'>
                    <h6 className={this.cardTitleClassNames()}>
                        {this.props.message.authorId}
                    </h6>
                <div className='float-right'>
                    <small className="card-subtitle mb-0 text-muted">{timeString}</small>
                    &nbsp;
                    <i className={this.checkmarkClassNames()} data-pack="default" data-tags="talk"></i>
                </div>
                </div>
                {this.state.text ? (
                    <p className="card-text mb-0">{this.state.text}</p>
               ) : null}
                </div>
            </div>
        );
    }

    messageClassNames = () => {
        let classes = "card w-75 mb-2 chat-message";
        if (this.props.isFromMe) {
            classes += " float-right border-primary"
        } else {
            classes += " border-neutral"
        }
        return classes;
    }

    cardTitleClassNames = () => {
        let classes = "card-title mb-1 float-left";
        if (this.props.isFromMe) {
            classes += " text-primary"
        } else {
            classes += " text-neutral"
        }
        return classes;
    }

    checkmarkClassNames = () => {
        // [class.text-muted]="!message.isSent" [class.text-info]="message.isSent"
        return "ion-checkmark text-info"
    }
    
    checkJson = (message) => {
    	try {  
		  let json = JSON.parse(decodeURIComponent(message));
		  console.log(json)
		  var that = this;
		if (json.type === "image") {
		const poolData = {UserPoolId: awsExports.awsmobile.aws_user_pools_id, ClientId: awsExports.awsmobile.aws_user_pools_web_client_id};
		const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

		// React
		const cognitoUser = userPool.getCurrentUser();
		  if (cognitoUser != null) {
			cognitoUser.getSession((err, session) => {
			  if (err) {
				console.log(err);
			  } else if (!session.isValid()) {
				console.log("Invalid session.");
			  } else {
				console.log("IdToken: " + session.getIdToken().getJwtToken());
				const AWSService = AWS;
				AWSService.config.update({
				  region: "us-east-1",
				  credentials: new AWSService.CognitoIdentityCredentials({
					IdentityPoolId: awsExports.awsmobile.aws_cognito_identity_pool_id
				  }),
				});	
				const s3 = new AWSService.S3({
				  apiVersion: '2006-03-01',
				  params: { Bucket: "induswhatsapp", Key: json.url.split("/")[3]}
				});	
				 s3.getObject( function(err, data) {
				   if (err) {
				   console.log(err, err.stack);
				   } // an error occurred
				   else    {
				    console.log(data);           // successful response
				   /*
				   data = {
					AcceptRanges: "bytes", 
					ContentLength: 3191, 
					ContentType: "image/jpeg", 
					ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
					LastModified: <Date Representation>, 
					Metadata: {
					}, 
					TagCount: 2, 
					VersionId: "null"
				   }
				   */
					var blob = new Blob( [ data.Body ], { type: "image/jpeg" } );
					var urlCreator = window.URL || window.webkitURL;
					var imageUrl = urlCreator.createObjectURL( blob );	
					that.setState({ ... that.state, imgUrl: imageUrl})	
					/*var decoder = new TextDecoder('utf8');
					var b64encoded = btoa(decoder.decode(data.Body));	
					console.log("base64 data: ", b64encoded)
					that.setState({ ... that.state, imgUrl: b64encoded})*/
					}						   
				 });							 				
			  }
			});
		  } else {
			console.log("User not found.");			
		  }	
		}  		    
		} catch (e) {  
		  this.setState({ ... this.state, text: decodeURIComponent(message)})  
		}
    }
}

export default ChatMessage;
