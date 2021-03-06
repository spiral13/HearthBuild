import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Chart, Bars, Layer, Animate } from 'rumble-charts';


import sortBy from '../../utils/sortBy';
import removeDuplicates from '../../utils/remove-duplicates';

import TextFieldGroup from '../common/TextFieldGroup';
import SelectListGroup from '../common/SelectListGroup';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';
import Spinner from '../common/Spinner';

import Banner from '../common/Banner';
import DeckBuilderMetas from './DeckBuilderMetas';
import PoolCard from './PoolCard';
import DeckCard from './DeckCard';

import zerowing from '../../assets/img/zerowing.png'

class DeckBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      classCards: [],
      neutralCards: [],
      hoverCard: 'http://media.services.zam.com/v1/media/byName/hs/cards/enus/EX1_009.png',
      tabs: {
        classTab: true,
        neutralTab: false
      },
      title: '',
      type: '',
      description: '',
      format: '',
      class: '',
      cost: 0,
      cardCount: 0,
      deckCards: [],
      cardIndex: 0,
      errors: {},
      poolname: ''
    }
  }

  // If there is errors in the form, display them
  static getDerivedStateFromProps = (nextProps) => {
    return {errors: nextProps.errors};
  }

  componentDidMount() {
    let cards = [];

    // If there are cards in pool, filter them by format
    if(this.props.cardsPool) {
      cards = this.sortByFormat(this.props.cardsPool, this.props.format)
    }

    // Sort cards by cost
    cards = cards.sort(sortBy('cost'));

    // Transfer data from REdux to local state
    this.setState({
      class: this.props.class,
      format: this.props.format,
      // Filter class cards
      classCards: cards.filter(card => card.playerClass === this.props.class),
      // Filter neutral cards
      neutralCards: cards.filter(card => card.playerClass === 'Neutral'),
    });
  }

  // Sort cards from pool by format
  sortByFormat = (pool, format) => {
    let cards = [];
    if (format === 'standard') {
      cards = pool.filter(card => card.cardSet === 'The Witchwood' || card.cardSet === 'Knights of the Frozen Throne' || card.cardSet === 'Kobolds & Catacombs' || card.cardSet === 'Journey to Un\'Goro' || card.cardSet === 'Classic' || card.cardSet === 'Basic');
    }
    else {
      cards = pool;
    }

    return cards;
  }

  // Add card to deck
  addCard = (cardToAdd) => () => {
    let newIndex = this.state.cardIndex;
    const { deckCards } = this.state;
    // If there are less than 30 cards in the deck
    if (deckCards.length < 30) {
      // If card is legendary, set the limit to 1.
      // If not, set the limit to 2
      if ((cardToAdd.rarity === 'Legendary' && deckCards.filter(card => cardToAdd.cardId === card.cardId).length < 1) || (cardToAdd.rarity !== "Legendary" && deckCards.filter(card => cardToAdd.cardId === card.cardId).length < 2)) {
        // Increment card index
        newIndex += 1;
        // Add card cost to total cost
        this.computeCost(cardToAdd.rarity, 'add');
        // Send new card to the deck
        this.setState(prevState => ({

          deckCards: [...prevState.deckCards, { ...cardToAdd, index: newIndex }],
          cardIndex: ++newIndex,
          // Increment card count
          cardCount: ++prevState.cardCount
        }));
      }
    }
  }

  // Remove a card from deck
  removeCard = (cardIndex) => () => {
    // Get card by its index
    const cardToRemove = this.state.deckCards.filter(card => card.index === cardIndex);
    // Substract card cost from total cost
    this.computeCost(cardToRemove[0].rarity, 'substract');

    // Get a new array without ward to remove
    const cards = this.state.deckCards.filter(card => card.index !== cardIndex);

    // Send new deck to local state
    this.setState(prevState => ({
      deckCards: cards,
      // Decrement card count
      cardCount: --prevState.cardCount
    }));
  }

  // Add card cost to total cost, depending on card rarity
  computeCost = (rarity, operation) => {
    let newCost = 0;
    switch (rarity) {
      case 'Common':
        newCost = 40
        break;
      case 'Rare':
        newCost = 100
        break;
      case 'Epic':
        newCost = 400
        break;
      case 'Legendary':
        newCost = 1600
        break;
      default:
        break;
    }

    // If operation parameter is passed to the function
    if (operation) {
      // Add cost 
      if (operation === 'add') {
        this.setState(prevState => ({
          cost: prevState.cost + newCost
        }));
      }

      //Substract cost
      if (operation === 'substract') {
        this.setState(prevState => ({
          cost: prevState.cost - newCost
        }));
      }
    }
  }

  // On tab click, display classCards or neutralCards
  showCards = () => {
    if(this.state.tabs.neutralTab) {
      return this.state.neutralCards
    }
    else {
      return this.state.classCards;
    }
  }

  // Send card image to local state
  onCardHover = (imgPath) => () => {
    this.setState({
      hoverCard: imgPath
    });
  }

  // Set active state to clicked tab
  handleTab = (tabToActivate) => (e) => {
    this.setState(prevState => ({
      tabs: {
        [tabToActivate]: !prevState.tabs[tabToActivate]
      }
    }));
  }

  onChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    })
  }

  onSubmit = (e) => {
    e.preventDefault();

    const cards = [];

    // Create a array of cards with specific props
    this.state.deckCards.forEach(card => {
      cards.push({
        name: card.name,
        class: card.playerClass,
        rarity: card.rarity,
        cardSet: card.cardSet,
        cost: card.cost,
        img: card.img,
      })
    });

    // Data to send to axios
    const deckData = {
      title: this.state.title,
      // Clean title for URL format
      slug: this.state.title.trim(' ').toLowerCase(),
      class: this.state.class,
      format: this.state.format,
      description: this.state.description,
      type: this.state.type,
      cost: this.state.cost,
      cards,
      views: 0,
      likes: [],
      comments: [],
      createdAt: Date.now()
    }

    // Send data to axios
    this.props.actions.sendDeck(deckData);
    
  }

  render() {
    const { tabs, hoverCard, deckCards, errors } = this.state;

    const { deckTypes } = this.props;

    // Set cards to show in pool
    let cardsToShow = this.showCards();

    // Search by card name system
    if(this.state.poolname !== '') {
      cardsToShow = cardsToShow.filter(card => card.name.toLowerCase().includes(this.state.poolname.toLowerCase()));
    }

    // Mana curve
    const chartData = [{ data:[] }];

    for (let i = 0; i <= 10; i++) {
      chartData[0].data.push([i, deckCards.filter(card => card.cost === i).length]);
    }

    // Remove duplicates from deck display
    const uniqueCards = removeDuplicates(deckCards, 'cardId');

    return (
      <div>
        <Banner title="Deck builder" subtitle="One deck to rule them all" bannerClass="builder-banner"/>
        <main>
          <section className="section" id="deck-builder">
            <div className="container">
              <div className="deck-builder">
                {/* FORM */}
                <form onSubmit={this.onSubmit}>
                  <div className="deck-builder--form">
                    <div className="fields">
                      <TextFieldGroup
                        name="title"
                        label="Deck title"
                        value={this.state.title}
                        error={errors.title}
                        onChange={this.onChange}
                        icon="fas fa-pencil-alt"
                      />
                      <SelectListGroup
                        name="type"
                        label="Type"
                        value={this.state.type}
                        error={errors.type}
                        onChange={this.onChange}
                        options={deckTypes}
                      />
                    </div>
                  </div>

                  <div className="columns deck-builder--cards">
                    <div className="column is-4 is-hidden-mobile deck-builder--cards-preview" onClick={() => console.log(uniqueCards)}>
                      <img src={hoverCard} alt="" />
                    </div>
                    <div className="column is-8 deck-builder--cards-table">
                      <div className="pool-header">
                        <div className="tabs">
                          <ul>
                            <li className={classnames('', {
                              'is-active': tabs.classTab
                            })} onClick={this.handleTab('classTab')}>
                              <a>{this.props.class}</a>
                            </li>

                            <li className={classnames('', {
                              'is-active': tabs.neutralTab
                            })} onClick={this.handleTab('neutralTab')}>
                              <a>Neutrals</a>
                            </li>
                          </ul>
                        </div>
                      
                        <TextFieldGroup
                          name="poolname"
                          value={this.state.poolname}
                          placeholder="Search by name"
                          onChange={this.onChange}
                          icon="fas fa-pencil-alt"
                        />
                      </div>
                      {this.props.cardsLoading ? (
                        <Spinner />
                      ) : (
                        <table className="table">
                          <tbody>
                            {cardsToShow.map(card => (
                              <PoolCard
                                key={card.cardId}
                                onCardHover={this.onCardHover}
                                card={card}
                                onCardClick={this.addCard}
                              />
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  <div className="deck-builder--list">
                    <DeckBuilderMetas count={this.state.cardCount} cost={this.state.cost} />
                    <div className="columns">
                      <div className="column is-8 deck-builder--list-table">
                        {deckCards.length === 0 ? (
                          <div className="box deck-builder--list-empty">
                            <img src={zerowing} alt="Zero Wing Meme"/>
                            <h2>All your cards are belong to us</h2>
                          </div>  
                        ) : (
                          <table className="table">
                            <tbody>
                              {
                                uniqueCards.map(card => (
                                  <DeckCard
                                    key={card.index}
                                    card={card}
                                    onDeleteClick={this.removeCard}
                                    // Handle double cards
                                    isTwice={deckCards.filter(c => c.cardId === card.cardId).length > 1}
                                  />
                                ))
                              }
                            </tbody>
                          </table>
                        )}
                      </div>
                      <div className="column is-4 deck-builder--curve">
                        <div className="box mana-curve">
                          {deckCards.length >= 1 ? (
                            <Chart width={400} height={400} series={chartData}>
                              <Layer width="100%" height="100%" position="middle center">
                                <Animate _ease="bounce elastic">
                                  <Bars
                                    colors={['#1EC2A7']}
                                    barWidth="9%"
                                    innerPadding="2%"
                                  />
                                </Animate>
                              </Layer>
                            </Chart>
                          ) : (
                            <div className="empty">
                              <p>Add cards to see the curve</p>
                            </div> 
                          )}
                        </div>
                      </div>
                    </div>
                  </div >

                  <div className="deck-builder--desc">
                    <h3 className="title">Deck guide</h3>
                    <TextAreaFieldGroup
                      name="description"
                      value={this.state.description}
                      error={errors.description}
                      onChange={this.onChange}
                      placeholder="Explain how do you play this deck..."
                    />
                  </div>
                  
                  {errors.cardCount && (
                    <div className="notification is-danger">
                      {errors.cardCount}
                    </div>
                  )}

                  <input type="submit" className="button is-primary is-medium deck-builder--submit" value="Submit" />
                </form>
              </div>
            </div>
          </section>
        </main>
      </div> 
    )
  }
}

DeckBuilder.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func.isRequired).isRequired,
  cardsLoading: PropTypes.bool.isRequired,
  cardsPool: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  class: PropTypes.string.isRequired,
  format: PropTypes.string.isRequired,
}

export default DeckBuilder;

