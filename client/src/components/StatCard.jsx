const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="stat-icon-wrapper">
        <Icon className="stat-icon" />
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {trend && <span className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
      </div>
    </div>
  );
};

export default StatCard;
