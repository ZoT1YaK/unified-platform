import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {createEvent, deleteEvent, fetchEventResources, fetchEvents, updateRSVP} from "../../services/eventService";

describe("eventService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchEvents", () => {
        it("should fetch events without search query", async () => {
            const token = "test-token";
            const events = [{id: 1, name: "Event 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {events}];
                }
                return [404];
            });

            const result = await fetchEvents(token);
            expect(result).toEqual(events);
        });

        it("should fetch events with search query", async () => {
            const token = "test-token";
            const searchQuery = "test";
            const events = [{id: 1, name: "Event 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.params.search === searchQuery) {
                    return [200, {events}];
                }
                return [404];
            });

            const result = await fetchEvents(token, searchQuery);
            expect(result).toEqual(events);
        });
    });

    describe("updateRSVP", () => {
        it("should update RSVP status to Accepted", async () => {
            const token = "test-token";
            const eventId = "1";
            const response = "Accepted";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/response`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({
                    event_id: eventId,
                    response
                })) {
                    return [200];
                }
                return [404];
            });

            await expect(updateRSVP(token, eventId, response)).resolves.toBeUndefined();
        });
    });

    describe("deleteEvent", () => {
        it("should delete an event", async () => {
            const token = "test-token";
            const eventId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/delete/${eventId}`;
            mock.onDelete(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200];
                }
                return [404];
            });

            await expect(deleteEvent(token, eventId)).resolves.toBeUndefined();
        });

        it("should return 404 for non-existing event", async () => {
            const token = "test-token";
            const eventId = "999";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/delete/${eventId}`;
            mock.onDelete(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [404];
                }
                return [404];
            });

            await expect(deleteEvent(token, eventId)).rejects.toThrow();
        });
    });

    describe("fetchEventResources", () => {
        it("should fetch event resources", async () => {
            const token = "test-token";
            const resources = {departments: [], teams: [], locations: []};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/resources`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, resources];
                }
                return [404];
            });

            const result = await fetchEventResources(token);
            expect(result).toEqual(resources);
        });

        it("should return 404 for invalid token", async () => {
            const token = "invalid-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/resources`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [404];
                }
                return [404];
            });

            await expect(fetchEventResources(token)).rejects.toThrow();
        });
    });

    describe("createEvent", () => {
        it("should create a new event", async () => {
            const token = "test-token";
            const payload = {name: "New Event"};
            const createdEvent = {id: 1, name: "New Event"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/create`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify(payload)) {
                    return [200, createdEvent];
                }
                return [404];
            });

            const result = await createEvent(token, payload);
            expect(result).toEqual(createdEvent);
        });

        it("should return 404 for invalid token", async () => {
            const token = "invalid-token";
            const payload = {name: "New Event"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/events/create`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [404];
                }
                return [404];
            });

            await expect(createEvent(token, payload)).rejects.toThrow();
        });
    });
});
