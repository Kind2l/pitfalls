import ImageLoader from "@Components/ImageLoader";
import React from "react";

const PlayerHand = ({ hand, isMyTurn, handleClickCard }) => {
  return (
    <section className="player-area">
      <div className="player-area__hand">
        {hand.length > 0 ? (
          hand.map((card) => {
            const { name, tag, id, type } = card;

            return (
              <button
                key={id}
                data-id={id}
                data-type={type}
                className="card"
                disabled={!isMyTurn}
                onClick={() => handleClickCard(card)}
              >
                <div className="card-top">{name}</div>
                <div className="card-image">
                  {type === "borne" ? (
                    <div className={tag}>{tag}</div>
                  ) : (
                    <ImageLoader name={`card_${tag}`} alt={name} />
                  )}
                </div>
                <div className="card-bottom">{name}</div>
              </button>
            );
          })
        ) : (
          <p>Aucune carte dans la main</p>
        )}
      </div>
    </section>
  );
};

export default PlayerHand;
