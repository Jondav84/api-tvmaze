/** @format */

// Import necessary modules and functions
const axios = require("axios");
const {
  populateShows,
  populateEpisodes,
  searchForShowAndDisplay,
  populateAndDisplay,
} = require("./app");

// Mock the axios.get function to return dummy data
jest.mock("axios");
axios.get.mockResolvedValue({ data: [] });

describe("TV Show Search Application", () => {
  beforeEach(() => {
    // Set up the HTML structure for testing
    document.body.innerHTML = `
      <div id="showsList"></div>
      <div id="episodesArea"></div>
    `;
  });

  afterEach(() => {
    // Clear the HTML structure after each test
    document.body.innerHTML = "";
  });

  describe("populateShows", () => {
    test("should populate the shows list with show data", () => {
      const shows = [
        { id: 1, name: "Show 1", rating: 8.5 },
        { id: 2, name: "Show 2", rating: 7.9 },
      ];

      populateShows(shows);

      const showsList = document.getElementById("showsList");
      const showElements = showsList.querySelectorAll(".Show");
      expect(showElements.length).toBe(2);

      const show1Element = showsList.querySelector('[data-show-id="1"]');
      expect(show1Element).not.toBeNull();
      expect(show1Element.querySelector(".text-primary").textContent).toBe(
        "Show 1"
      );
      expect(show1Element.querySelector("small").textContent).toBe(
        "Rating: 8.5"
      );

      const show2Element = showsList.querySelector('[data-show-id="2"]');
      expect(show2Element).not.toBeNull();
      expect(show2Element.querySelector(".text-primary").textContent).toBe(
        "Show 2"
      );
      expect(show2Element.querySelector("small").textContent).toBe(
        "Rating: 7.9"
      );
    });
  });

  describe("populateEpisodes", () => {
    test("should populate the episodes list with episode data", () => {
      const episodes = [
        { id: 1, name: "Episode 1", season: 1, number: 1 },
        { id: 2, name: "Episode 2", season: 1, number: 2 },
      ];

      populateEpisodes(episodes);

      const episodesList = document.getElementById("episodesList");
      const episodeElements = episodesList.querySelectorAll("li");
      expect(episodeElements.length).toBe(2);

      const episode1Element = episodesList.querySelector("li:nth-child(1)");
      expect(episode1Element.textContent).toContain("Episode 1");
      expect(episode1Element.textContent).toContain("season 1, episode 1");

      const episode2Element = episodesList.querySelector("li:nth-child(2)");
      expect(episode2Element.textContent).toContain("Episode 2");
      expect(episode2Element.textContent).toContain("season 1, episode 2");
    });
  });

  describe("searchForShowAndDisplay", () => {
    test("should make a request to the TV Maze API with the search term", async () => {
      const searchTerm = "Friends";
      const mockedResponse = [
        { show: { id: 1, name: "Friends" } },
        { show: { id: 2, name: "Friends Reunion" } },
      ];
      axios.get.mockResolvedValueOnce({ data: mockedResponse });

      // Set up the search form
      const searchForm = document.createElement("form");
      searchForm.id = "searchForm";
      const searchTermInput = document.createElement("input");
      searchTermInput.id = "searchForm-term";
      searchTermInput.value = searchTerm;
      searchForm.appendChild(searchTermInput);
      document.body.appendChild(searchForm);

      // Spy on the populateShows function
      const populateShowsSpy = jest.spyOn(window, "populateShows");

      // Call the function being tested
      await searchForShowAndDisplay();

      // Expect the request to be made with the correct search term
      expect(axios.get).toHaveBeenCalledWith(
        "https://api.tvmaze.com/search/shows",
        {
          params: { q: searchTerm },
        }
      );

      // Expect the populateShows function to be called with the mocked response
      expect(populateShowsSpy).toHaveBeenCalledWith(mockedResponse);

      // Clean up
      searchForm.remove();
      populateShowsSpy.mockRestore();
    });
  });
  describe("populateAndDisplay", () => {
    test("should populate shows and episodes and display them", async () => {
      // Mock the API response
      const mockedShows = [
        { id: 1, name: "Show 1", rating: 8.5 },
        { id: 2, name: "Show 2", rating: 7.9 },
      ];
      const mockedEpisodes = [
        { id: 1, name: "Episode 1", season: 1, number: 1 },
        { id: 2, name: "Episode 2", season: 1, number: 2 },
      ];

      // Mock the necessary functions
      const populateShowsMock = populateShows;
      const populateEpisodesMock = populateEpisodes;

      // Mock the API requests
      axios.get
        .mockResolvedValueOnce({ data: mockedShows })
        .mockResolvedValueOnce({ data: mockedEpisodes });

      // Call the function being tested
      await populateAndDisplay();

      // Expect the API requests to be made with the correct URLs
      expect(axios.get).toHaveBeenCalledWith("https://api.tvmaze.com/shows");
      expect(axios.get).toHaveBeenCalledWith("https://api.tvmaze.com/episodes");

      // Expect the populateShows function to be called with the mocked shows data
      expect(populateShowsMock).toHaveBeenCalledWith(mockedShows);

      // Expect the populateEpisodes function to be called with the mocked episodes data
      expect(populateEpisodesMock).toHaveBeenCalledWith(mockedEpisodes);
    });
  });
});
