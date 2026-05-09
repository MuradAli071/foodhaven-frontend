function Profile({ user }) {
  return (
    <section className="section profile-section">
      <div className="page-header">
        <h2>Profile</h2>
        <p>Manage your account information and order details.</p>
      </div>
      <div className="profile-card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
        {user.address && <p><strong>Address:</strong> {user.address}</p>}
      </div>
    </section>
  );
}

export default Profile;
