import ImageLoader from "@Components/ImageLoader";
import React from "react";

const PlayerHand = ({ hand, isMyTurn, handleClickCard }) => {
  const cardOrder = {
    borne: 1,
    parade: 2,
    attaque: 3,
    bonus: 4,
  };

  const sortedHand = [...hand].sort((a, b) => {
    if (cardOrder[a.type] !== cardOrder[b.type]) {
      return cardOrder[a.type] - cardOrder[b.type];
    }
    if (a.type === "borne" || a.type === "attaque" || a.type === "parade") {
      return parseInt(a.tag) - parseInt(b.tag);
    }
    return a.tag.localeCompare(b.tag);
  });

  const totalCards = sortedHand.length;
  const isOdd = totalCards % 2 !== 0;
  const midIndex = Math.floor(totalCards / 2);

  return (
    <section className="player-area">
      <div className="player-area__hand">
        {sortedHand.map((card, index) => {
          console.log(card);
          const { name, tag, id, type } = card;
          let positionClass = "";

          if (isOdd) {
            if (index === midIndex) positionClass = "middle"; // Carte unique au centre
          } else {
            if (index === midIndex) positionClass = "middle-left"; // Une des deux cartes au centre
            if (index === midIndex - 1) positionClass = "middle-right"; // L'autre carte au centre
          }

          return (
            <button
              key={id}
              data-id={id}
              data-type={type}
              className={`card card-${index} ${positionClass}`}
              disabled={!isMyTurn}
              onClick={() => handleClickCard(card)}
            >
              <div className="card-top">{name}</div>
              <div className="card-image">
                {type === "borne" ? (
                  <div className={tag}>{tag}</div>
                ) : (
                  <ImageLoader name={`cards/${tag}`} alt={name} />
                )}
              </div>
              <div className="card-bottom">{name}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PlayerHand;
