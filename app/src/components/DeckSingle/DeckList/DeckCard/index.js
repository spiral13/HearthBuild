import React from 'react';
import PropTypes from 'prop-types';

const DeckCard = ({ cost, name }) => (
  <div className="panel-block deck--list-card">
    <div className="deck--list-card-cost">
      <span className="deck--list-card-cost--text">{cost}</span>
      <span className="deck--list-card-cost--icon">
        <svg>
          <use xlinkHref="img/misc/misc-mana.svg#misc-mana" />
        </svg>
      </span>
    </div>
    <span className="deck--list-card-name">{name}</span>
    <div className="deck--list-card-count is-rare">
      <span className="deck--list-card-count--text">2</span>
    </div>
  </div>
);

DeckCard.propTypes = {
  cost: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default DeckCard;
