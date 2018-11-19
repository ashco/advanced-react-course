import Link from 'next/link';

const Nav = (props) => (
  <div>
    <Link href="/">
      <a>Home!</a>
    </Link>
    <Link href="/sell">
      <a>Sell!</a>
    </Link>
  </div>
);

export default Nav;
