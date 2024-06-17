// util/seed_db.js

import Job from '../models/Job.js';
import User from '../models/User.js';
import { fakerEN_US as faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testUserPassword = faker.internet.password();

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await mongoose.connect(mongoURL);
    await Job.deleteMany({});
    await User.deleteMany({});

    testUser = new User({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: testUserPassword,
    });
    await testUser.save();

    const jobs = Array.from({ length: 20 }, () => ({
      company: faker.company.name(),
      position: faker.person.jobTitle(),
      status: ["applied", "interviewing", "offered", "rejected"][Math.floor(4 * Math.random())], 
      createdBy: testUser._id,
    }));

    await Job.insertMany(jobs);
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  } finally {
    await mongoose.disconnect();
  }
  return testUser;
};

const factory = {
  build: async (model, props) => {
    if (model === "user") {
      return new User({
        name: props.name || faker.person.fullName(),
        email: props.email || faker.internet.email(),
        password: props.password || faker.internet.password(),
      });
    } else if (model === "job") {
      return {
        title: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      };
    }
    throw new Error("Unknown model type");
  }
};

export { testUserPassword, seed_db, factory };
