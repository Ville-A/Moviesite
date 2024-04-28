import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reviews.css';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/review/allReviews');
        const data = response.data;

        if (response.status < 200 || response.status >= 300) {
          throw new Error('Failed to fetch reviews from database');
        }

        const reviewsWithPosters = await Promise.all(data.map(async (review) => {
          try {
            const tmdbResponse = await axios.get(`/tmdb/poster?id=${review.mdbdata}&type=movie`);

            if (tmdbResponse.data && tmdbResponse.data.poster_path) {
              return {
                ...review,
                posterUrl: tmdbResponse.data.poster_path,
                title: tmdbResponse.data.title,
                details: tmdbResponse.data.overview,
                link: 'https://www.themoviedb.org/movie/' + tmdbResponse.data.id
              };
            } else {
              return {
                ...review,
                title: tmdbResponse.data.title,
                details: tmdbResponse.data.overview
              };
            }
          } catch (error) {
            console.error('Failed to fetch poster from TMDB', error);
            return { ...review };
          }
        }));

        setReviews(reviewsWithPosters);
      } catch (error) {
        console.error('Failed to fetch reviews from database', error);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className='review-container'>
      <div className='review-header'>
        <h1>Annetut arvostelut</h1>
      </div>
      
      <div className='review-area'>
        {reviews.map((review, index) => (
          <div className='review-card' key={index}>
            <div className='review-text'>
            <p>Arvostelija: {review.username}</p>
            <p>Elokuvan nimi: {review.title}</p>
            <p>Arvostelu: {review.review}</p>
            <BasicRating value={review.star}></BasicRating>
            </div>
          <div>
            <a href={review.link}target="_blank">{review.posterUrl && <img className="review-picture" src={`https://image.tmdb.org/t/p/original${review.posterUrl}`} alt="Movie Poster" />}</a>
            </div>
           </div>
        ))}
      </div>
    </div>
  );
}

const BasicRating = ({ value }) => {
  return (
      <div className='rating'>
          <Box
              sx={{
                  '& > legend': { mt: 2 },
                  '& .MuiRating-icon': {
                      fontSize: '1vw',
                  },
              }}
          >
              <Rating className="read-only" value={value} readOnly />
          </Box>
      </div>
  );
};
