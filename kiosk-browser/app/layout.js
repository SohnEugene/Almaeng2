// app/layout.js
export const metadata = {
  title: 'Kiosk Browser',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
