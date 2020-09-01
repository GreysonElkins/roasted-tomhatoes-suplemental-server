const express = require('express');
const app = express();
const cors = require('cors');

// Designate the port this server will run through
app.set(process.env.port || 5000);

// Declare app-level middleware
app.use(express.json());
app.use(cors());

// Define the information stored in app.locals - 
// you can add as many key/value pairs to the app.locals object as you wish!
app.locals.title = 'Rancid Tomatillos Microservice Server';
app.locals.encouragement = ["You can do it!", "I believe in you!", "You got this!"];
app.locals.comments = [{author: "Charlie", movieId: 149, id: 1, comment: "This movie is rock and roll"}]
app.locals.favoriteMovieIds = {favorites: [620, 437518, 594718]}

// Example GET endpoint
app.get('/api/v1/cheerleading', (request, response) => {
  response.status(200).json(app.locals.encouragement);
})

// Declare COMMENTING endpoints here 👇
app.post('/api/v1/movies/:movieId/comments', (request, response) => {
  const { movieId } = request.params;
  const requiredProperties = [ "comment", "author" ];
  const receivedProperties = Object.keys(request.body);

  for (let property of requiredProperties) {
    if (!receivedProperties.includes(property)) {
      return response.status(422).json({error: `Cannot POST: missing property ${property} in request.`});
    }
  }
  const newComment = {
    ...request.body,
    movieId: +movieId,
    id: Date.now()
  }

  app.locals.comments.push(newComment);
  return response.status(201).json({ newComment: newComment });
})

app.get('/api/v1/movies/:movieId/comments', (request, response) => {
  const { movieId } = request.params;

  const commentsByMovie = app.locals.comments.filter(comment => comment.movieId === +movieId)
  response.status(200).json({ comments: commentsByMovie });
})

// Declare FAVORITING endpoints here 👇
app.post('/api/v1/favorites', (request, response) => {
  const requiredProperties = [ "id" ];
  const receivedProperties = Object.keys(request.body);

  for (let property of requiredProperties) {
    if (!receivedProperties.includes(property)) {
      return response.status(422).json({error: `Cannot POST: missing property ${property} in request.`});
    }
  }
  
  let message;
  const movieId = +request.body.id
  const foundMovieIndex = app.locals.favoriteMovieIds.favorites.findIndex(id => id === movieId);
  
  if (foundMovieIndex < 0) {
    app.locals.favoriteMovieIds.favorites.push(movieId);
    message = `Movie with an id of ${movieId} was favorited`
  } else {
    app.locals.favoriteMovieIds.favorites.splice(foundMovieIndex, 1);
    message = `Movie with an id of ${movieId} was un-favorited`
  }

  return response.status(201).json({ message });
})

app.get('/api/v1/favorites', (request, response) => {
  response.status(200).json(app.locals.favoriteMovieIds);
})

app.delete('/api/v1/favorites/:id', (request, response) => {
  const movie_id = +request.params.id
  let favorites = app.locals.favoriteMovieIds.favorites
  if(movie_id && favorites.includes(movie_id)) {
    app.locals.favoriteMovieIds.favorites = favorites.filter(movie => movie !== movie_id)
    return response.status(200).json(favorites)
  } else {
    response.status(404).json(movie_id)
  }
})

// Listen for queries to this server
app.listen(app.get('port'), () => console.log(`${app.locals.title} is now listening on port ${app.get('port')}!`));