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
        const response = await fetch('http://localhost:3001/review/allReviews');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews from database');
        }
        const data = await response.json();

        // Haetaan TMDB:stä kullekin arvostelulle vastaava posterin osoite
        const reviewsWithPosters = await Promise.all(data.map(async (review) => {
          try {
            const tmdbResponse = await axios.get(`http://localhost:3001/tmdb/poster?id=${review.mdbdata}&type=movie`);

            // Tarkistetaan, onko vastauksessa posterin URL
            if (tmdbResponse.data && tmdbResponse.data.poster_path) {
              return {
                ...review,
                posterUrl: tmdbResponse.data.poster_path,
                title: tmdbResponse.data.title,
                details: tmdbResponse.data.overview,
                link: 'https://www.themoviedb.org/movie/' + tmdbResponse.data.id
              };
            } else {
              // Palautetaan alkuperäinen arvostelu ilman posterin osoitetta, jos haku epäonnistui
              return {
                ...review,
                title: tmdbResponse.data.title,
                details: tmdbResponse.data.overview
              };
            }
          } catch (error) {
            console.error('Failed to fetch poster from TMDB', error);
            return { ...review }; // Palautetaan alkuperäinen arvostelu virhetilanteessa
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
              <a href={review.link} target="_blank">{review.posterUrl && <img className="review-picture" src={`https://image.tmdb.org/t/p/original${review.posterUrl}`} alt="Movie Poster" />}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BasicRating = ({ value }) => {
  return (
    <div>
    <Box className='rating'
        sx={{
            '& > legend': { mt: 2 },
            '& .MuiRating-icon': {
                fontSize: '16px', // Default font size
            },
            '@media (max-width: 1200px)': {
                '& .MuiRating-icon': {
                    fontSize: '14px', // Adjust for screens up to 1200px
                },
            },
            '@media (max-width: 800px)': {
                '& .MuiRating-icon': {
                    fontSize: '12px', // Adjust for screens up to 800px
                },
            },
            '@media (max-width: 400px)': {
                '& .MuiRating-icon': {
                    fontSize: '10px', // Adjust for screens up to 400px
                },
            },
        }}
    >
        <Rating className="read-only" value={value} readOnly />
    </Box>
</div>
  );
};
