const request = require("supertest");
const app = require("../../app");
const {
  connectToMongoDB,
  disconnectToMongoDB,
} = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets/planets.model");

describe("launches API", () => {
  beforeAll(async () => {
    await connectToMongoDB();

    await loadPlanetsData();
  });

  afterAll(async () => {
    await disconnectToMongoDB();
  });

  describe("Test Get /v1/launches", () => {
    test("It should respond with 200 success", async () => {
      await request(app)
        .get("/v1/launches")
        .expect("content-type", /json/)
        .expect(200);
    });
  });

  describe("Test Post /v1/launches", () => {
    const completeLaunchData = {
      mission: "qwe",
      rocket: "asd",
      target: "zxc",
      launchDate: "January 4, 2018",
    };

    const launchDataWithoutDate = {
      mission: "qwe",
      rocket: "asd",
      target: "zxc",
    };

    const launchDataWithInvalidDate = {
      mission: "qwe",
      rocket: "asd",
      target: "zxc",
      launchDate: "Invalid Date",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("content-type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing required properties and respond with 400 bad request", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid dates and respond with 400 bad request", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid Launch Date",
      });
    });
  });
});
