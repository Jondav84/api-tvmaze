/** @format */

"use strict";

const missingImage =
  "https://cdn5.vectorstock.com/i/1000x1000/65/74/broken-tv-signal-vector-2026574.jpg";
const $episodesList = $("#episodesList");
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

async function getShowsByTerm(term) {
  const response = await axios.get("https://api.tvmaze.com/search/shows", {
    params: { q: term },
  });
  return response.data.map((result) => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary ? show.summary : "No info Available",
      rating: show.rating.average ? show.rating.average : "Not Rated",
      network: show.network ? show.network.name : show.webChannel.name,
      runtime: show.averageRuntime,
      image: show.image ? show.image.medium : missingImage,
    };
  });
}

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>Rating: ${show.rating}</small></div>
             <div><small>Runtime: ${show.runtime} minutes</small></div>
             <div><small>Network: ${show.network}</small></div>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

async function getEpisodesOfShow(id) {
  const response = await axios.get(
    `https://api.tvmaze.com/shows/${id}/episodes`
  );
  return response.data.map((e) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
    summary: e.summary,
  }));
}

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    if (!episode.summary) {
      const ep = $(
        `<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`
      );
      $episodesList.append(ep);
    } else {
      const ep = $(
        `<li>${episode.name} (season ${episode.season}, episode ${episode.number}) <br/> Summary: ${episode.summary}</li>`
      );
      $episodesList.append(ep);
    }
  }
  $episodesArea.show();
}

async function populateAndDisplay(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
  $(".Show").not($(evt.target).closest(".Show")).hide();
}

$showsList.on("click", ".Show-getEpisodes", populateAndDisplay);
