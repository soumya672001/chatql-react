import React, { Component } from 'react';
import { graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';
import AuthContext from '../../../AuthContext';
import * as queries from '../../../graphql/queries';
import * as subscriptions from '../../../graphql/subscriptions';
import './ChatConversationList.css';

class ChatConversationList extends Component {
    static contextType = AuthContext;
    render() {
        const username = this.context ? this.context.username : null;
        return (
            <div>
                <div className="section-header">
                    <h6 className='mb-0'><i className="ion-person-stalker" data-pack="default" data-tags="talk"></i> Conversations</h6>
                </div>
                <div className="convo-list">
                    <div className="list-group mb-2">
                    {
                        username ?
                            <Connect
                                query={graphqlOperation(queries.GetUserAndConversations, { id: username })}
                                subscription={graphqlOperation(subscriptions.OnCreateUserConversation, {
                                    userId: username
                                })}
                                onSubscriptionMsg={(prev, { onCreateConvoLink }) => {
                                	console.log(`oncreateconvolink: ${onCreateConvoLink}`)
                                    try {
                                        prev.getUser.conversations.items = prev.getUser.conversations.items.filter(item => item.id !== onCreateConvoLink.id );
                                        prev.getUser.conversations.items.unshift(onCreateConvoLink);
                                    } catch (e) {
                                        console.log('Failed to merge user conversation subscription');
                                    }
                                    return prev;
                                }}
                            >
                                {({ data, loading, error }) => {
                                    const { getUser } = data || { getUser: { conversations: [] } }
                                    console.log(getUser);
                                    if (error) return (<h3>Error: {error}</h3>);
                                    let userConversations;
                                    try {
                                        userConversations = getUser.conversations.items;
                                    } catch (e) {
                                        userConversations = [];
                                    }
                                    if (loading || !userConversations) return (<h3>Loading...</h3>);
                                    return userConversations.map((userConversation, i) => (
                                        <a
                                            key={i}
                                            className={this.conversationClassNames()}
                                            onClick={() => this.props.onChatSelected(userConversation.conversation)}>
                                            <div className="card w-75 ">
                                            <div className="card-body p-1">
                                            <div className='clearfix'>
											<p className="card-title mb-1 text-primary">
												{userConversation.conversation.name}
											</p>
											<div className='float-right'>
												<small className="card-subtitle mb-0 text-muted">{this.convertDate(userConversation.updatedAt)}</small>
											</div>											
											</div>
											</div>
											</div>
                                        </a>
                                    ));
                                }}
                            </Connect> : null
                    }
                    </div>
                </div>
            </div>
        );
    }

    conversationClassNames = (id) => {
        return "list-group-item list-group-item-action p-3 border-0"
    }
    convertDate = (date) => {
    	var d = new Date(date)
        return d.toLocaleString();
    }    
}

export default ChatConversationList;
