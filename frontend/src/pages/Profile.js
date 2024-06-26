import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './profile.css';
import { jwtToken } from '../components/Signals';
import { Unstable_Popup as BasePopup } from '@mui/base/Unstable_Popup';
import { styled } from '@mui/system';
import SeeInvites from './SeeInvites';
import ProfilePicUpdate from '../components/ProfilePicUpdate';
import { Link } from 'react-router-dom';


export default function Profile() {
  const [username, setUsername] = useState('');
  const [imageid, setImageId] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [openPasswordPopup, setOpenPasswordPopup] = useState(false);
  const [openPhotoPopup, setOpenPhotoPopup] = useState(false);
  const [loading, setLoading] = useState(true); // State to track loading status
  const [anchorEl, setAnchorEl] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [joindate, setJoinDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/users/personal', {
          headers: {
            Authorization: `Bearer ${jwtToken.value}`
          }
        });
        setUsername(response.data.username);
        setImageId(response.data.imageid);
        const joinDate = new Date(response.data.joindate);
        const finlandDate = joinDate.toLocaleDateString('fi-FI', { day: 'numeric', month: 'long', year: 'numeric',});
        setJoinDate(finlandDate);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching username and imageid:', error);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchData(); // Call the fetchData function

    // Clean-up function
    return () => {
      // You can add clean-up code here if needed
    };
  }, []); // Empty dependency array to run only once on component mount

  useEffect(() => {
    // Define fetchUserGroups function
    const fetchUserGroups = async () => {
      try {
        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) {
          console.error('JWT token not found');
          return;
        }

        const response = await axios.get('http://localhost:3001/groupmember/userGroups', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        });

        setUserGroups(response.data.groups);
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };

    fetchUserGroups();

    const fetchUserFavourites = async () => {
      try {
        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) {
          console.error('JWT token not found');
          return;
        }

        const response = await axios.get('http://localhost:3001/favourite/getFavourites', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          },
          params: {
            'items': 5
          }
        });
        const favoritesData = response.data.favourites;
        /*console.log('favouritesData: ', favoritesData);
        console.log('type of favouritedata: ', typeof favoritesData);
        console.log('favoritesData length:', favoritesData.length);*/
        if (favoritesData && favoritesData.length > 0) {
          const favouritesWithPosters = await Promise.all(favoritesData.map(async (favourites) => {
            try {
              const tmdbResponse = await axios.get(`http://localhost:3001/tmdb/poster?id=${favourites.mdbdata}&type=${favourites.type}`);
              const tmdbData = tmdbResponse.data;
              if (tmdbData && tmdbData.poster_path) {
                let linkType = null;
                let title = null;
                if (favourites.type === "movie") {
                  linkType = "movie";
                  //console.log(favourites.type, linkType);
                  title = tmdbData.title;
                } else {
                  linkType = "tv";
                  title = tmdbData.name;
                  //console.log(favourites.type, linkType);
                }
                return {
                  ...favourites,
                  posterUrl: tmdbData.poster_path,
                  title: title,
                  details: tmdbData.overview,
                  link: `https://www.themoviedb.org/${linkType}/${tmdbData.id}`
                };
              } else {
                //console.log("lisätään ilman imdb tietoja")
                return favourites
              }

            } catch (error) {
              console.error('Failed to fetch poster from TMDB', error);
              return favourites;
            }
          }));
          setFavourites(favouritesWithPosters);
        } else {
          //console.log('No favorites data found');
        }

      } catch (error) {
        //console.error('Error fetching user favourites: ', error);
      }
    };
    fetchUserFavourites();

    return () => {
      // Cleanup function
    };
  }, []);

  useEffect(() => {
    //console.log('Image ID:', imageid);
    //console.log('Image Source:', `../img/avatar/${imageid}.png`);
  }, [imageid]);

  // Render loading message while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDeleteUser = async () => {
    if (deleteConfirmed) {
      try {
        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) {
          console.error('JWT token not found');
          return;
        }
        const headers = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtToken}` } };
        const deleteResponse = await axios.delete(`/users/delete`, headers);
        if (deleteResponse.status === 200) {
          //console.log('User deleted successfully');
          sessionStorage.removeItem('token');
          window.location.reload();
        } else {
          console.error('Failed to send delete request');
        }
      } catch (error) {
        console.error('Error sending delete request:', error);
      }
    } else {
      setDeleteConfirmed(true);
    }
  };

  const handleDeleteGroup = async (idgroup) => {
    try {
      const deleteResponse = await axios.delete('/group/deleteGroup', {
        params: { idgroup: idgroup }
      })
      if (deleteResponse.status === 200) {
        window.location.reload();
      } else {
        console.error('Failed to send group delete request');
      }
    } catch (error) {
      console.error('Error sending group delete request', error);
    }

  }

  const id = openPasswordPopup ? 'password-popup' : undefined;

  const togglePasswordPopup = (event) => {
    setAnchorEl(event.currentTarget); // Set anchorEl to the clicked button
    setOpenPasswordPopup(!openPasswordPopup); // Toggle the password popup
  };

  const togglePhotoPopup = () => {
    setOpenPhotoPopup(!openPhotoPopup); // Toggle the photo popup
  };

  const handleClosePopup = () => {
    setOpenPhotoPopup(false); // Close the photo popup
    window.location.reload();
  };

  const imageSrc = `../img/avatar/${imageid}.png`;
  //console.log('Image Source:', imageSrc);

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New passwords don't match");
      return;
    }

    axios.post('/password/change-password', {
      username: username,
      oldPassword: oldPassword,
      newPassword: newPassword,
    })
      .then(response => {
        alert('Password changed successfully');
        // Optionally, you can reset the form fields here
      })
      .catch(error => {
        console.error('Error changing password:', error);
        setPasswordChangeError('Password change failed');
      });
  };

  const adminGroups = userGroups.filter(group => group.grouprole === "admin");
  const nonAdminGroups = userGroups.filter(group => group.grouprole !== "admin");

  return (
    <div className='profile-container'>
      <div className='profile-info'>
        <div className='profile-pic'>
          {imageid && (
            <img
              className='profile-photo'
              src={require(`../img/avatar/${imageid}.png`)}
              alt="topimg"
            />
          )}

          <div className='profile-add' onClick={togglePhotoPopup}> {/* Move the onClick handler here */}
            <label htmlFor='profile-input'>
              <i className="photo-add fa-solid fa-plus"></i>
            </label>
          </div>
        </div>

        <div className='profile-text'>
          <p>Käyttäjätunnus: {username}</p>
          <p>Liittynyt: {joindate}</p>
          <div className='profile-buttons'>
            <Button aria-describedby={id} type="button" onClick={togglePasswordPopup} className='change-password'>
              Vaihda salasana
            </Button>
            <Button deleteButton={true} onClick={handleDeleteUser}>
              {deleteConfirmed ? "Haluatko varmasti poistaa" : "Poista käyttäjä"}
            </Button>
          </div>
          <BasePopup id={id} open={openPasswordPopup} anchor={anchorEl} onClose={handleClosePopup}>
            <div className='vaihdasalasana'>
              <PopupBody>
                <form className='change-password-form'>
                  <label>Vanha salasana</label>
                  <input type='password' value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                  <label>Uusi salasana</label>
                  <input type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <label>Uusi salasana uudestaan</label>
                  <input type='password' value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                  <button onClick={handleChangePassword}>Vaihda salasana</button>
                  {passwordChangeError && <p>{passwordChangeError}</p>}
                </form>
              </PopupBody>
            </div>
          </BasePopup>

        </div>
      </div>
      <div className='profile-favorite'>
        <h3 className='profile-group-name'>VIIMEISIMMÄT SUOSIKIT</h3>
        <div className='profile-favorite-items'>
          {Array.isArray(favourites) && favourites.map((favourite, mediaItem, index) => (
            <Link
              key={mediaItem.id}
              className={`favourite-card-item favourite-${index}`}
              to={`${favourite.link}`}
              style={{ textDecoration: 'none', color: 'inherit', margin: '0', padding: '0', background: 'none' }}>
              <a href={favourite.link} target="_blank">{favourite.posterUrl && <img className="profile-favourite-picture" src={`https://image.tmdb.org/t/p/w300${favourite.posterUrl}`} alt="Movie Poster" />}</a>
              <h3 className='profile-favourite-title'>{favourite.title}</h3>
            </Link>
          ))}
        </div>
      </div>
      <div className='profile-group-container'>
        <div className='profile-group'>
          <h3 className='profile-group-name'>OMAT RYHMÄT (Admin)</h3>
          <ul className='profile-group-list'>
            {adminGroups.map((group, index) => (
              <li key={group.idgroup} className='profile-group-list-item'>
                {group.groupname}
                <div className="centered-button-container">
                {group.grouprole === "admin" && (
                  <button className='profile-group-button' onClick={() => handleDeleteGroup(group.idgroup)}>
                    Poista ryhmä
                  </button>
                )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className='profile-group'>
          <h3 className='profile-group-name'>OMAT RYHMÄT (Jäsen)</h3>
          <ul className='profile-group-list'>
            {nonAdminGroups.map((group, index) => (
              <li key={group.idgroup} className='profile-group-list-item'>
                {group.groupname}
              </li>
            ))}
          </ul>
        </div>
        <div className='profile-invites'>
          <SeeInvites /> { }
        </div>
      </div>

      {openPhotoPopup && <ProfilePicUpdate closePhotoPopup={handleClosePopup} setImageId={setImageId} username={username} />}

    </div>
  );
}

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const blue = {
  200: '#99CCFF',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0066CC',
};

const darkRed = {
  500: '#8B0000', // Dark Red
  400: '#A52A2A', // Brown
  600: '#800000', // Maroon
};

const PopupBody = styled('div')(
  ({ theme }) => `
  width: max-content;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  box-shadow: ${theme.palette.mode === 'dark'
      ? `0px 4px 8px rgb(0 0 0 / 0.7)`
      : `0px 4px 8px rgb(0 0 0 / 0.1)`
    };
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  z-index: 1;
  position: absolute;
  bottom: calc(0); // Position the popup below the button
  left: 50%;
  transform: translateX(-50%);
`,
);

const Button = styled('button')(
  ({ theme, deleteButton }) => ({
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: 'white',
    transition: 'all 150ms ease',
    cursor: 'pointer',
    borderRadius: 8,
    padding: '4px 10px',
    '@media (max-width: 800px)': {
      padding: '4px 10px', // Adjust padding for smaller screens
      fontSize: '0.6rem', // Decrease font size for smaller screens
    },
    '@media (max-width: 400px)': {
      padding: '2px 8px', // Adjust padding for smaller screens
      fontSize: '0.25rem', // Decrease font size for smaller screens
    },
    ...(deleteButton
      ? {
        backgroundColor: darkRed[500],
        border: `1px solid ${darkRed[500]}`,
        boxShadow: `0 2px 1px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(45, 45, 60, 0.2)'}, inset 0 1.5px 1px ${darkRed[400]}, inset 0 -2px 1px ${darkRed[600]}`,
        '&:hover': {
          backgroundColor: darkRed[600],
          borderColor: darkRed[600],
        },
        '&:active': {
          backgroundColor: darkRed[400],
          borderColor: darkRed[400],
          boxShadow: 'none',
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 4px ${theme.palette.mode === 'dark' ? darkRed[500] : darkRed[400]}`,
          outline: 'none',
        },
        '&.disabled': {
          opacity: 0.4,
          cursor: 'not-allowed',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: darkRed[500],
            borderColor: darkRed[500],
          },
        },
      }
      : {
        backgroundColor: blue[500],
        border: `1px solid ${blue[500]}`,
        boxShadow: `0 2px 1px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(45, 45, 60, 0.2)'}, inset 0 1.5px 1px ${blue[400]}, inset 0 -2px 1px ${blue[600]}`,
        '&:hover': {
          backgroundColor: blue[600],
        },
        '&:active': {
          backgroundColor: blue[700],
          boxShadow: 'none',
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]}`,
          outline: 'none',
        },
        '&.disabled': {
          opacity: 0.4,
          cursor: 'not-allowed',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: blue[500],
            borderColor: blue[500],
          },
        },
      }),
  }),
  { shouldForwardProp: (prop) => prop !== 'deleteButton' }
);
