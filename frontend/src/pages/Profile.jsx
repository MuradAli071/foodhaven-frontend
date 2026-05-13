function Profile({ user }) {
  return (
    <section className="profile-section">
      <div className="page-header">
        <div className="form-icon">👤</div>
        <h2>Your Profile</h2>
        <p>Manage your account information</p>
      </div>
      <div className="profile-card">
        <p>
          <span>Full Name</span>
          <span>{user.name}</span>
        </p>
        <p>
          <span>Email Address</span>
          <span>{user.email}</span>
        </p>
        <p>
          <span>Account Type</span>
          <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
        </p>
        {user.phone && (
          <p>
            <span>Phone Number</span>
            <span>{user.phone}</span>
          </p>
        )}
        {user.address && (
          <p>
            <span>Delivery Address</span>
            <span>{user.address}</span>
          </p>
        )}
      </div>
    </section>
  );
}

export default Profile;
