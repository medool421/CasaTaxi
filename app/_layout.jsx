import { Stack } from 'expo-router';
import { StackScreen } from 'react-native-screens';

export default function RootLayout() {
  return (
  <Stack>
   <Stack.Screen
   name = "index"
   options={{
    headerShown: false,

  }}
   />
   <Stack.Screen
   name = "booking"
   options={{
    headerShown: false,
    presentation: "formSheet",
    sheetAllowedDetents: [0.3 , 0.8],
    sheetExpandsWhenScrolledToEdge:false,
    sheetCornerRadius:20,
  }}
   />
  </Stack>
  );}