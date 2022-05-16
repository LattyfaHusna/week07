const MongoClient = require("mongodb").MongoClient;
const User = require("./user");
const { faker } = require('@faker-js/faker');
const bcrypt = require("bcryptjs");
const saltRounds = 10;
let encryptedPassword;

///////////////////////**Creating sample user by using Faker-js***//////////////////////////////////////////////////
const userName = faker.name.findName(); 
const UserEmail = faker.internet.email();
const userpassword = faker.internet.password();
//const encryptedPassword = "$2a$05$3pqF8gapjY82H.T4G7LNauba.lObTbsVWsBkAh2jEKl"


  bcrypt.genSalt(saltRounds, function (saltError, salt) {
    if (saltError) {
      throw saltError
    } else {
      bcrypt.hash(userpassword, salt, function(hashError, hash) {
      if (hashError) {
        throw hashError
      } else {
        encryptedPassword=hash;
        console.log("Hash:",hash);
        
      }
      })
    }
    })
  //const encryptedPassword = hash

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe("User Account", () => {
  let client;
  beforeAll(async () => {
    client = await MongoClient.connect(  
      "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.6ac4l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
      { 
        useNewUrlParser: true
       }
    );
    User.injectDB(client);
  })
  afterAll(async () => {
    await client.close();
  })


  //Test should be pass , if any new user is created
  test("New user registration", async () => {        
    const res = await User.register(userName,UserEmail,userpassword,encryptedPassword)
    expect(res).toBe("New user is created");    
  })
    // To detect the duplicate user - test will be passed if any duplicate user was found during the user sign up 
  test("Duplicate username", async () => {
    const res = await User.register(userName,UserEmail,userpassword,encryptedPassword)
    expect(res).toBe("The username already exist!");
  })


  //If the username, email and password do not match to any doc saved in db
  test("Username doesn't exist to login", async () => {
    const res = await User.login("sehun","sehun@gmail.com","1234")
    expect(res).toBe("ERROR! The information is not MATCH");
  })

  //If the username do not match to any usernames saved in db
  test("User login invalid username", async () => {
    const res = await User.login("sehun",UserEmail,userpassword)
    expect(res).toBe("The Username is invalid");
  })

  //If the password do not match to any passwords saved in db
  test("User login invalid password", async () => {
    const res = await User.login("Bryant Fay","Ethel_Daniel@gmail.com","1234")
    expect(res).toBe("The Password is invalid");
  })

  //If the email id do not match to any email ids saved in db
  test("User login invalid email id", async () => {
    const res = await User.login("Bryant Fay","123@gmail.com","t4Iz0ZE1eJhM5Rq")
    expect(res).toBe("The Email id is invalid");
  })

  //If the username,email and password are matched to any existing user, then check for the encrypted password before allowing the user to login in VMSystem
  test("User login successfully", async () => {
    const res = await User.login(userName,UserEmail,userpassword)
    expect(res.username).toBe(userName);
    expect(res.password).toBe(userpassword);
    expect(res.email).toBe(UserEmail);
    //expect(res.encrypt).toBe(encryptedPassword);
  })
});