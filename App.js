import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";

/* ---------------------------------------------------------------
   Reusable pieces
---------------------------------------------------------------- */

// A label + TextInput + error message. All other props
// (keyboardType, secureTextEntry, maxLength, ...) are passed straight
// to the TextInput, so one component covers every text input type.
function Input({ label, error, ...props }) {
  return (
    <View style={styles.field}>
      <Text>{label}</Text>
      <TextInput style={styles.input} {...props} />
      {error ? <Text>Error: {error}</Text> : null}
    </View>
  );
}

// Radio buttons: React Native has none built in, so we build them
// from Pressable + a piece of state (the selected value).
function Radio({ label, options, value, onChange, error }) {
  return (
    <View style={styles.field}>
      <Text>{label}</Text>
      {options.map((option) => (
        <Pressable key={option} onPress={() => onChange(option)}>
          <Text>
            {value === option ? "(x) " : "( ) "}
            {option}
          </Text>
        </Pressable>
      ))}
      {error ? <Text>Error: {error}</Text> : null}
    </View>
  );
}

// Keeps ALL the fields of one form in a single state object.
// - set(key, value) updates one field
// - submit(validate, build) checks the fields, and if they are valid
//   prints the data as a JSON object to the console
function useForm(initial) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setDone(false);
  };

  const submit = (validate, build = (f) => f) => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setDone(false);
      return;
    }
    console.log(JSON.stringify(build(form), null, 2));
    setDone(true);
  };

  return { form, set, errors, done, submit };
}

const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/* ---------------------------------------------------------------
   Screen 1: Sign Up
---------------------------------------------------------------- */

const GENRES = ["Fiction", "Science", "History", "Technology"];

function validateSignUp(f) {
  const e = {};
  if (!f.fullName.trim()) e.fullName = "Full name is required.";
  if (!f.email.trim()) e.email = "Email is required.";
  else if (!looksLikeEmail(f.email)) e.email = "Enter a valid email.";
  if (!f.password) e.password = "Password is required.";
  else if (f.password.length < 8) e.password = "Use at least 8 characters.";
  if (!f.phone.trim()) e.phone = "Phone is required.";
  if (!f.age) e.age = "Age is required.";
  if (!f.gender) e.gender = "Choose an option.";
  if (!f.membership) e.membership = "Choose a membership.";
  if (!f.agreedToTerms) e.agreedToTerms = "You must agree to the terms.";
  return e;
}

function SignUp() {
  const { form, set, errors, done, submit } = useForm({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
    membership: "",
    genres: [],
    agreedToTerms: false,
  });

  // Add or remove a genre from the genres array
  const toggleGenre = (genre) => {
    const next = form.genres.includes(genre)
      ? form.genres.filter((g) => g !== genre)
      : [...form.genres, genre];
    set("genres", next);
  };

  return (
    <View>
      <Text>Sign Up</Text>

      <Input
        label="Full name *"
        value={form.fullName}
        onChangeText={(v) => set("fullName", v)}
        error={errors.fullName}
      />

      <Input
        label="Email *"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(v) => set("email", v)}
        error={errors.email}
      />

      <Input
        label="Password *"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => set("password", v)}
        error={errors.password}
      />

      <Input
        label="Phone *"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(v) => set("phone", v)}
        error={errors.phone}
      />

      <Input
        label="Age *"
        keyboardType="numeric"
        maxLength={3}
        value={form.age}
        onChangeText={(v) => set("age", v.replace(/[^0-9]/g, ""))}
        error={errors.age}
      />

      <Radio
        label="Gender *"
        options={["Female", "Male", "Other"]}
        value={form.gender}
        onChange={(v) => set("gender", v)}
        error={errors.gender}
      />

      <View style={styles.field}>
        <Text>Membership *</Text>
        <Picker
          selectedValue={form.membership}
          onValueChange={(v) => set("membership", v)}
        >
          <Picker.Item label="Select a membership" value="" />
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Standard" value="standard" />
          <Picker.Item label="Premium" value="premium" />
        </Picker>
        {errors.membership ? <Text>Error: {errors.membership}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text>Favourite genres (optional)</Text>
        {GENRES.map((genre) => (
          <View key={genre} style={styles.row}>
            <Checkbox
              value={form.genres.includes(genre)}
              onValueChange={() => toggleGenre(genre)}
            />
            <Text> {genre}</Text>
          </View>
        ))}
      </View>

      <View style={styles.field}>
        <View style={styles.row}>
          <Checkbox
            value={form.agreedToTerms}
            onValueChange={(v) => set("agreedToTerms", v)}
          />
          <Text> I agree to the terms *</Text>
        </View>
        {errors.agreedToTerms ? <Text>Error: {errors.agreedToTerms}</Text> : null}
      </View>

      <Button title="Sign Up" onPress={() => submit(validateSignUp)} />
      {done ? <Text>Submitted. Check the console.</Text> : null}
    </View>
  );
}

/* ---------------------------------------------------------------
   Screen 2: Login
---------------------------------------------------------------- */

function validateLogin(f) {
  const e = {};
  if (!f.email.trim()) e.email = "Email is required.";
  else if (!looksLikeEmail(f.email)) e.email = "Enter a valid email.";
  if (!f.password) e.password = "Password is required.";
  return e;
}

function Login() {
  const { form, set, errors, done, submit } = useForm({
    email: "",
    password: "",
    rememberMe: false,
  });

  return (
    <View>
      <Text>Login</Text>

      <Input
        label="Email *"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(v) => set("email", v)}
        error={errors.email}
      />

      <Input
        label="Password *"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => set("password", v)}
        error={errors.password}
      />

      <View style={styles.field}>
        <View style={styles.row}>
          <Switch
            value={form.rememberMe}
            onValueChange={(v) => set("rememberMe", v)}
          />
          <Text> Remember me</Text>
        </View>
      </View>

      <Button title="Log in" onPress={() => submit(validateLogin)} />
      {done ? <Text>Submitted. Check the console.</Text> : null}
    </View>
  );
}

/* ---------------------------------------------------------------
   Screen 3: Borrow a Book
---------------------------------------------------------------- */

const BOOKS = [
  "Things Fall Apart - Chinua Achebe",
  "Half of a Yellow Sun - Chimamanda Ngozi Adichie",
  "Born a Crime - Trevor Noah",
  "The Alchemist - Paulo Coelho",
  "Atomic Habits - James Clear",
];

function validateBorrow(f) {
  const e = {};
  if (!f.memberEmail.trim()) e.memberEmail = "Member email is required.";
  else if (!looksLikeEmail(f.memberEmail)) e.memberEmail = "Enter a valid email.";
  if (!f.book) e.book = "Choose a book.";
  if (!f.format) e.format = "Choose a format.";
  if (!f.days) e.days = "Choose a borrowing period.";
  if (!f.confirmed) e.confirmed = "You must confirm this.";
  return e;
}

function Borrow() {
  const today = new Date().toISOString().slice(0, 10);

  const { form, set, errors, done, submit } = useForm({
    memberEmail: "",
    book: "",
    format: "",
    borrowDate: today,
    days: "",
    notes: "",
    reminder: false,
    confirmed: false,
  });

  // build() adds a calculated field (dueDate) before the JSON is logged
  const withDueDate = (f) => {
    const due = new Date();
    due.setDate(due.getDate() + Number(f.days));
    return { ...f, dueDate: due.toISOString().slice(0, 10) };
  };

  return (
    <View>
      <Text>Borrow a Book</Text>

      <Input
        label="Member email *"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.memberEmail}
        onChangeText={(v) => set("memberEmail", v)}
        error={errors.memberEmail}
      />

      <View style={styles.field}>
        <Text>Book *</Text>
        <Picker selectedValue={form.book} onValueChange={(v) => set("book", v)}>
          <Picker.Item label="Select a book" value="" />
          {BOOKS.map((title) => (
            <Picker.Item key={title} label={title} value={title} />
          ))}
        </Picker>
        {errors.book ? <Text>Error: {errors.book}</Text> : null}
      </View>

      <Radio
        label="Format *"
        options={["Hardcopy", "eBook"]}
        value={form.format}
        onChange={(v) => set("format", v)}
        error={errors.format}
      />

      {/* editable={false} makes this input read-only */}
      <Input
        label="Borrow date (read only)"
        value={form.borrowDate}
        editable={false}
      />

      <View style={styles.field}>
        <Text>Borrowing period *</Text>
        <Picker selectedValue={form.days} onValueChange={(v) => set("days", v)}>
          <Picker.Item label="Select a period" value="" />
          <Picker.Item label="7 days" value="7" />
          <Picker.Item label="14 days" value="14" />
          <Picker.Item label="21 days" value="21" />
        </Picker>
        {errors.days ? <Text>Error: {errors.days}</Text> : null}
      </View>

      <Input
        label="Notes (optional, max 200 characters)"
        multiline
        numberOfLines={4}
        maxLength={200}
        textAlignVertical="top"
        value={form.notes}
        onChangeText={(v) => set("notes", v)}
      />

      <View style={styles.field}>
        <View style={styles.row}>
          <Switch
            value={form.reminder}
            onValueChange={(v) => set("reminder", v)}
          />
          <Text> Remind me before the due date</Text>
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.row}>
          <Checkbox
            value={form.confirmed}
            onValueChange={(v) => set("confirmed", v)}
          />
          <Text> I will return the book on time *</Text>
        </View>
        {errors.confirmed ? <Text>Error: {errors.confirmed}</Text> : null}
      </View>

      <Button
        title="Borrow"
        onPress={() => submit(validateBorrow, withDueDate)}
      />
      {done ? <Text>Submitted. Check the console.</Text> : null}
    </View>
  );
}

/* ---------------------------------------------------------------
   App: switches between the three screens
---------------------------------------------------------------- */

const BOOK_IMAGES = [
  {
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    image: "https://covers.openlibrary.org/b/isbn/9780060935467-M.jpg",
  },
  {
    title: "Half of a Yellow Sun",
    author: "Chimamanda Ngozi Adichie",
    image: "https://covers.openlibrary.org/b/isbn/9780007200283-M.jpg",
  },
  {
    title: "Born a Crime",
    author: "Trevor Noah",
    image: "https://covers.openlibrary.org/b/isbn/9780399588198-M.jpg",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    image: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg",
  },
];

export default function App() {
  const [screen, setScreen] = useState("signup");
  const [galleryVisible, setGalleryVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text>Online Book Store</Text>

      <View style={styles.nav}>
        <Button title="Sign Up" onPress={() => setScreen("signup")} />
        <Button title="Login" onPress={() => setScreen("login")} />
        <Button title="Borrow" onPress={() => setScreen("borrow")} />
      </View>

      <Button title="Book Images" onPress={() => setGalleryVisible(true)} />

      {screen === "signup" && <SignUp />}
      {screen === "login" && <Login />}
      {screen === "borrow" && <Borrow />}

      <Modal
        visible={galleryVisible}
        animationType="slide"
        onRequestClose={() => setGalleryVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.gallery}>
          <Text>Book Images</Text>
          <Button title="Close" onPress={() => setGalleryVisible(false)} />
          {BOOK_IMAGES.map((book) => (
            <View key={book.title} style={styles.bookRow}>
              <Image
                source={{ uri: book.image }}
                style={styles.bookImage}
                resizeMode="contain"
                accessibilityLabel={`${book.title} book cover`}
              />
              <View>
                <Text>{book.title}</Text>
                <Text>{book.author}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

// Only the bare minimum: some padding, and a border so inputs are visible
const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 50 },
  nav: { flexDirection: "row", justifyContent: "space-around", marginVertical: 16 },
  field: { marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center" },
  input: { borderWidth: 1, padding: 6 },
  gallery: { padding: 20, paddingTop: 50 },
  bookRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  bookImage: { width: 100, height: 140, marginRight: 12 },
});