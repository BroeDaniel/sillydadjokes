import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FlipMove from 'react-flip-move';
import axios from 'axios';
import Joke from './Joke';
import './JokeList.css';

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    this.state = {
      // Get the jokes from localStorage, and if there are no jokes, make the state an empty array
      jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    console.log(this.seenJokes);
  }

  deleteJoke = id => {
    this.setState(
      { jokes: this.state.jokes.filter(joke => joke.id !== id) },
      () =>
        window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    );
  };

  handleClick = () => {
    this.setState({ loading: true }, this.getJokes);
  };

  handleVote = (id, delta) => {
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      () =>
        window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    );
  };

  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }

  getJokes = async () => {
    try {
      // Load Jokes
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get('https://icanhazdadjoke.com/', {
          headers: {
            Accept: 'application/json'
          }
        });
        if (!this.seenJokes.has(res.data.joke)) {
          jokes.push({ id: uuidv4(), text: res.data.joke, votes: 0 });
        }
      }

      // Set State and local Storage
      this.setState(
        st => ({
          loading: false,
          jokes: [...st.jokes, ...jokes]
        }),
        () =>
          window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  };

  render() {
    if (this.state.loading) {
      // return (
      //   <div className='JokeList'>
      //     <div className='JokeList-sidebar'>
      //       <h1 className='JokeList-title'>
      //         <span>Dad</span> Jokes
      //       </h1>
      //       <img
      //         src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
      //         alt='rolling of the floor lauging emoji'
      //       />
      //       <button className='JokeList-getMore' onClick={this.handleClick}>
      //         New Jokes
      //       </button>
      //     </div>
      //     <div className='JokeList-jokes'> <span className="animation">I'm a Joke</span></div>
      //   </div>
      // );

      return (
        <div className='JokeList-spinner'>
          <i className='far fa-8x fa-laugh fa-spin'></i>
          <h1 className='JokeList-title'>Loading...</h1>
        </div>
      );
    } else {
      let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
      return (
        <div className='JokeList'>
          <div className='JokeList-sidebar'>
            <h1 className='JokeList-title'>
              <span>Dad</span> Jokes
            </h1>
            <img
              src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
              alt='rolling of the floor lauging emoji'
            />
            <button className='JokeList-getMore' onClick={this.handleClick}>
              Fetch Jokes
            </button>
          </div>
          <div className='JokeList-jokes'>
          <FlipMove duration={500} easing="ease-out">
            {jokes.map((j, idx) => (
              <Joke
                key={j.id}
                id={j.id}
                text={j.text}
                votes={j.votes}
                upVote={() => this.handleVote(j.id, 1)}
                downVote={() => this.handleVote(j.id, -1)}
                deleteJoke={this.deleteJoke}
              />
            ))}
            </FlipMove>
          </div>
        </div>
      );
    }
  }
}

export default JokeList;
