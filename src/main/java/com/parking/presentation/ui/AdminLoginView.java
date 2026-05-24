package com.parking.presentation.ui;

import com.parking.domain.model.Role;
import com.parking.presentation.SceneNavigator;

public class AdminLoginView extends RoleLoginView {
    public AdminLoginView(SceneNavigator navigator) {
        super(
                navigator,
                "Admin Login",
                "🛡",
                "Enter admin username",
                "Enter password",
                "← Back to Home",
                "User Login",
                () -> navigator.show(new UserLoginView(navigator)),
                false
        );
    }

    @Override
    protected boolean matchesRole(Role role) {
        return role == Role.ADMIN;
    }

    @Override
    protected void openDashboard() {
        navigator().show(new AdminDashboardView(navigator()));
    }
}
