import React from 'react';
import Svg from '../common/Svg';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const DeckBuilderMetas =  ({ count, cost }) => (
  <div className="deck-builder--list-header">
    <h3 className="title">Deck preview</h3>
    <div className="deck-builder--list-header--metas">
      <span className="tags has-addons">
        <span className="tag is-medium is-dark">
          <Svg type="misc" value="dust" />
        </span>
        <span className="tag is-medium is-light">{cost}</span>
      </span>
      <span className="tags has-addons">
        <span className="tag is-medium is-dark">
          <span className="icon">
            <i className="fab fa-slack-hash"></i>
          </span>
        </span>
        <span className="tag is-medium is-light">
          <span
            id="card-count"
            className={classnames({
              'has-text-danger': count < 30,
              'has-text-primary': count === 30
            })}
          >
            {count}
          </span> / 30
      </span>
      </span>
    </div>
  </div>
)

DeckBuilderMetas.propTypes = {
  count: PropTypes.number.isRequired,
  cost: PropTypes.number.isRequired,
}

export default DeckBuilderMetas;
