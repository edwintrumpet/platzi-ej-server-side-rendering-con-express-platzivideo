import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setFavorite, deleteFavorite } from '../actions';
import '../assets/styles/components/CarouselItem.scss';
import playIcon from '../assets/static/play-icon.png';
import plusIcon from '../assets/static/plus-icon.png';

const CarouselItem = ({
  id,
  cover,
  title,
  year,
  contentRating,
  duration,
  setFavorite,
  deleteFavorite,
}) => {
  const handleSetFavorite = () => {
    setFavorite({ id, cover, title, year, contentRating, duration });
  };
  const handleDeleteFavorite = (itemId) => {
    deleteFavorite(itemId);
  };

  return (
    <div className='carousel-item'>
      <img className='carousel-item__img' src={cover} alt={title} />
      <div className='carousel-item__details'>
        <div>
          <img className='carousel-item__details--img' src={playIcon} alt='Play Icon' />
          <img
            onClick={handleSetFavorite}
            className='carousel-item__details--img'
            src={plusIcon}
            alt='Plus Icon'
          />
          <img
            onClick={() => handleDeleteFavorite(id)}
            className='carousel-item__details--img'
            src='https://static.platzi.com/media/public/uploads/remove-icon_a56b8107-2c02-49ed-bead-308031b0dd76.png'
            alt='Plus Icon'
          />
        </div>
        <p className='carousel-item__details--title'>{title}</p>
        <p className='carousel-item__details--subtitle'>{`${year} ${contentRating} ${duration}`}</p>
      </div>
    </div>
  ) ;
};

CarouselItem.propTypes = {
  cover: PropTypes.string,
  title: PropTypes.string,
  year: PropTypes.number,
  contentRating: PropTypes.string,
  duration: PropTypes.number,
};

const mapDispatchToProps = {
  setFavorite,
  deleteFavorite,
};

export default connect(null, mapDispatchToProps)(CarouselItem);
