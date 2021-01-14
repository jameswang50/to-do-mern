import React, { Component } from 'react';
import gql from 'graphql-tag';
import {graphql, compose} from 'react-apollo';
import {Paper, List, ListItem, ListItemSecondaryAction, ListItemText, Checkbox, IconButton} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Form from './Form';

const TodosQuery = gql(`{
  todos {
    id
    text
    complete
  }
}`)

const updateMutation = gql`
  mutation($id: ID!, $complete: Boolean!) {
    updateTodo(id: $id, complete: $complete)
  }
`;

const removeMutation = gql`
  mutation($id: ID!) {
    removeTodo(id: $id)
  }
`;

const createTodoMutation = gql`
  mutation($text: String!) {
    createTodo(text: $text) {
      id
      text
      complete
    }

  }
`;
class App extends Component {

  updateTodo = async todo => {
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        complete: !todo.complete
      },
      update: store => {
        const data = store.readQuery({query: TodosQuery });
        data.todos = data.todos.map(
          x =>
            x.id === todo.id 
              ? {
                ...todo,
                complete: !todo.complete
              }
              : x
        );

        store.writeQuery({ query: TodosQuery, data});
      }
    });
  };

  removeTodo = async todo => {
    await this.props.removeTodo({
      variables: {
        id: todo.id,
      },
      update: store => {
        const data = store.readQuery({query: TodosQuery });
        data.todos = data.todos.filter( x => x.id !== todo.id)

        store.writeQuery({ query: TodosQuery, data});
      }
    });
  };

  createTodo = async text => {
    await this.props.createTodo({
      variables: {
        text
      },
      update: (store, {data: {createTodo}}) => {
        const data = store.readQuery({query: TodosQuery});
        data.todos.unshift(createTodo);
        store.writeQuery({query: TodosQuery, data});
      }
    })

  }


  render() {
    const {data: {loading, todos}} = this.props;

    if(loading) {
      return null;
    }

    return (
      <div style={{display: "flex"}}>
        <div style={{margin: "auto", width: 400}}>
          <Paper elevation={1}>
            <Form submit={this.createTodo}/>
            <List>
              {todos.map(todo => (
                <ListItem
                  key={todo.id}
                  role={undefined}
                  dense
                  button
                  onClick={() => this.updateTodo(todo)}
                >
                  <Checkbox
                    checked={todo.complete}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText primary={todo.text} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => this.removeTodo(todo)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </div>
      </div>
    );
  }
}

export default compose(
    graphql(TodosQuery),
    graphql(updateMutation, {name: 'updateTodo'}),
    graphql(removeMutation, {name: 'removeTodo'}),
    graphql(createTodoMutation, {name: 'createTodo'})
  )(App);
