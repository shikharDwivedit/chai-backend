# Mongoose Pre-Save Hook and `this` Explanation

## 🔑 Key Terms

### 1. **Schema**
Think of a schema as a **blueprint** 🏗️.  
It tells Mongoose what fields (columns) a user will have and what type of data goes inside.  

Example:
```js
const userSchema = new Schema({
  username: String,
  email: String,
  password: String
});
```

This is like saying:  
- Every user will have a `username` (a string)  
- Every user will have an `email` (a string)  
- Every user will have a `password` (a string)  

---

### 2. **Model**
A model is like a **factory** 🏭 created from the schema.  
It lets you actually **make users** and talk to the database.  

```js
const User = model("User", userSchema);
```

Now `User` can:
- Create a user
- Save a user
- Find users
- Update users
- Delete users  

---

### 3. **Document**
A document is a **real object (instance)** you create from the model.  
It follows the schema rules and can be saved into MongoDB.  

Example:
```js
const user = new User({
  username: "dev",
  email: "dev@gmail.com",
  password: "123456"
});
```

Here:  
- `user` is a **document**.  
- It has fields (`username`, `email`, `password`) defined by the schema.  
- It also comes with **extra powers** (methods) from Mongoose, like `.save()`.  

---

### 4. **Middleware (pre / post hooks)**
Middleware in Mongoose are **functions that run automatically** before or after certain actions (like save, delete, update).  

Example:
```js
userSchema.pre("save", function(next) {
  // runs BEFORE saving the document
  console.log("Saving user:", this.username);
  next();
});
```

---

## ⚙️ How it all fits together in your code

1. **Schema (Blueprint)**
```js
const userSchema = new Schema({
  username: String,
  email: String,
  password: String
});
```

2. **Model (Factory)**
```js
const User = model("User", userSchema);
```

3. **Document (Actual object)**
```js
const user = new User({
  username: "dev",
  email: "dev@gmail.com",
  password: "123456"
});
```

4. **Saving (and Middleware kicks in)**
```js
await user.save();
```

Before it saves, the **pre("save") hook** runs:

```js
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  // 'this' is the document
  // before hashing:
  console.log("Before hashing:", this.password); // "123456"

  this.password = await bcrypt.hash(this.password, 10);

  // after hashing:
  console.log("After hashing:", this.password); // "$2b$10$..."

  next();
});
```

So MongoDB finally stores the **hashed password**, not the plain one.  

---

## ✅ Summary in plain English
- **Schema** = blueprint of your data.  
- **Model** = factory to create and manage data.  
- **Document** = actual object you create using the model.  
- **Middleware** = automatic function that runs before/after certain actions.  
- In your case, `this.password` works because `this` is the document (user object) being saved, and Mongoose put `password` on it because the schema said so.  

---

## 🔄 Flow Recap
1. You create a document:
```js
const user = new User({ username: "dev", password: "123456" });
```

2. You call:
```js
await user.save();
```

3. Mongoose checks: “Do we have any `.pre("save")` hooks?” → Yes.  

4. Runs the hook with `this = user document`.  
   - `this.password` → `"123456"`  

5. You hash the password:
```js
this.password = await bcrypt.hash(this.password, 10);
```

6. MongoDB saves the modified document (hashed password).  

---

✨ So yes: `.pre("save")` has access to the document being saved, and `this` points to that document.
