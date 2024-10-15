import { removeAuth } from '../api'

export const Navbar = ({ home, profile, offer, account, transactions }) => {
  const logout = () => {
    removeAuth()
    window.location = '/'
  }

  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          Crypto Exchange
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className={home ? 'nav-link active' : 'nav-link'}
                aria-current="page"
                href="/"
              >
                Home
              </a>
            </li>
            <li className="nav-item">
              <a
                className={offer ? 'nav-link active' : 'nav-link'}
                href="/offers"
              >
                Offers
              </a>
            </li>
            <li className="nav-item">
              <a
                className={profile ? 'nav-link active' : 'nav-link'}
                href="/profile"
              >
                Profile
              </a>
            </li>
            <li className="nav-item">
              <a
                className={account ? 'nav-link active' : 'nav-link'}
                href="/account"
              >
                Account
              </a>
            </li>
            <li className="nav-item">
              <a
                className={transactions ? 'nav-link active' : 'nav-link'}
                href="/transactions"
              >
                My Transactions
              </a>
            </li>
          </ul>
          <div className="d-flex" role="search">
            <button onClick={logout} className="px-4 btn ">
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
