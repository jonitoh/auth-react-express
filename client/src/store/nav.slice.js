/*
State management for navigation persistence in the application.
*/

export default function navSlice(set, get) {
  return {
    //states
    section: "calendar", //"/",

    //actions
    setSection: (section) => set({ section }),
    isSectionActive: (mySection) => mySection === get().section,
  };
}
