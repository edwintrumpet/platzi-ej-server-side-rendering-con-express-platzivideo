import React from 'react';
import { connect } from 'react-redux';
import Search from '../components/Search';
import Categories from '../components/Categories';
import Carousel from '../components/Carousel';
import CarouselItem from '../components/CarouselItem';
import '../assets/styles/App.scss';
import '../assets/styles/Media.scss';

const Home = ({ mylist, trends, originals }) => {
  return (
    <>
      <Search />
      {mylist.length > 0 && (
        <Categories title='Mi lista'>
          <Carousel>
            {
              mylist.map((item) => (
                <CarouselItem
                  key={item.id}
                  id={item.id}
                  cover={item.cover}
                  title={item.title}
                  year={item.year}
                  contentRating={item.contentRating}
                  duration={item.duration}
                />
              ))
            }
          </Carousel>
        </Categories>
      )}

      {trends.length > 0 && (
        <Categories title='Tendencias'>
          <Carousel>
            {
              trends.map((item) => (
                <CarouselItem
                  key={item.id}
                  id={item.id}
                  cover={item.cover}
                  title={item.title}
                  year={item.year}
                  contentRating={item.contentRating}
                  duration={item.duration}
                />
              ))
            }
          </Carousel>
        </Categories>
      )}

      {originals.length > 0 && (
        <Categories title='Originales de PlatziVideo'>
          <Carousel>
            {
              originals.map((item) => (
                <CarouselItem
                  key={item.id}
                  id={item.id}
                  cover={item.cover}
                  title={item.title}
                  year={item.year}
                  contentRating={item.contentRating}
                  duration={item.duration}
                />
              ))
            }
          </Carousel>
        </Categories>
      )}
    </>
  );

};

const mapStateToProps = (state) => {
  return {
    mylist: state.mylist,
    trends: state.trends,
    originals: state.originals,
  };
};

export default connect(mapStateToProps, null)(Home);
