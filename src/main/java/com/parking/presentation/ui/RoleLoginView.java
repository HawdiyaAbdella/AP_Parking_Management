package com.parking.presentation.ui;

import com.parking.domain.model.Role;
import com.parking.domain.model.User;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.View;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;

abstract class RoleLoginView implements View {
    private final SceneNavigator navigator;
    private final String title;
    private final String icon;
    private final String usernamePrompt;
    private final String passwordPrompt;
    private final String footerLeft;
    private final String footerRight;
    private final Runnable footerRightAction;
    private final boolean showCreateAccount;

    protected RoleLoginView(SceneNavigator navigator,
                            String title,
                            String icon,
                            String usernamePrompt,
                            String passwordPrompt,
                            String footerLeft,
                            String footerRight,
                            Runnable footerRightAction,
                            boolean showCreateAccount) {
        this.navigator = navigator;
        this.title = title;
        this.icon = icon;
        this.usernamePrompt = usernamePrompt;
        this.passwordPrompt = passwordPrompt;
        this.footerLeft = footerLeft;
        this.footerRight = footerRight;
        this.footerRightAction = footerRightAction;
        this.showCreateAccount = showCreateAccount;
    }

    @Override
    public Scene buildScene() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom right, #1f2f44 0%, #22384d 50%, #1a2940 100%);");

        VBox card = new VBox(18);
        card.setAlignment(Pos.CENTER);
        card.setPadding(new Insets(40, 42, 30, 42));
        card.setPrefWidth(450);
        card.setStyle("-fx-background-color: white; -fx-background-radius: 22; -fx-effect: dropshadow(gaussian, rgba(15, 23, 42, 0.20), 28, 0.22, 0, 10);");

        Label iconBox = new Label(icon);
        iconBox.setAlignment(Pos.CENTER);
        iconBox.setPrefSize(64, 64);
        iconBox.setStyle("-fx-background-color: linear-gradient(to bottom, #4cd97d, #28c76f); -fx-background-radius: 16; -fx-text-fill: white; -fx-font-size: 28; -fx-font-weight: 800;");

        Label heading = new Label(title);
        heading.setStyle("-fx-text-fill: #111827; -fx-font-size: 24; -fx-font-weight: 800;");

        Label subtitle = new Label("Vehicle Parking Management System");
        subtitle.setStyle("-fx-text-fill: #97a0ad; -fx-font-size: 16;");

        TextField username = new TextField();
        username.setPromptText(usernamePrompt);
        username.setStyle("-fx-background-radius: 10; -fx-border-radius: 10; -fx-padding: 12 14 12 14; -fx-border-color: #d9e2ec; -fx-background-color: white; -fx-highlight-fill: #31c86f; -fx-highlight-text-fill: white;");

        PasswordField password = new PasswordField();
        password.setPromptText(passwordPrompt);
        password.setStyle("-fx-background-radius: 10; -fx-border-radius: 10; -fx-padding: 12 14 12 14; -fx-border-color: #e5e7eb; -fx-background-color: white;");

        Label usernameLabel = createFieldLabel("Username");
        Label passwordLabel = createFieldLabel("Password");

        Label feedback = new Label();
        feedback.setStyle("-fx-text-fill: #b00020; -fx-font-size: 13;");

        Button signIn = new Button("Sign In →");
        signIn.setMaxWidth(Double.MAX_VALUE);
        signIn.setPrefHeight(48);
        signIn.setStyle("-fx-background-color: linear-gradient(to right, #39c86f, #2dbd63); -fx-text-fill: white; -fx-font-size: 16; -fx-font-weight: 800; -fx-background-radius: 10; -fx-cursor: hand;");
        signIn.setOnAction(e -> {
            try {
                User user = navigator.context().authUseCase()
                        .login(username.getText(), password.getText())
                        .orElse(null);
                if (user == null) {
                    feedback.setText("Invalid username or password");
                    return;
                }
                if (!matchesRole(user.role())) {
                    feedback.setText("This account is not authorized for this login screen");
                    return;
                }
                navigator.context().setCurrentUser(user);
                openDashboard();
            } catch (Exception ex) {
                feedback.setText("Login failed: " + ex.getMessage());
            }
        });

        HBox footer = new HBox(8);
        footer.setAlignment(Pos.CENTER_LEFT);
        Hyperlink left = new Hyperlink(footerLeft);
        left.setStyle("-fx-text-fill: #7d8794; -fx-border-color: transparent; -fx-padding: 0;");
        left.setOnAction(e -> navigator.show(new LandingView(navigator)));
        footer.getChildren().add(left);

        Region footerSpacer = new Region();
        HBox.setHgrow(footerSpacer, javafx.scene.layout.Priority.ALWAYS);
        footer.getChildren().add(footerSpacer);

        Hyperlink right = new Hyperlink(footerRight);
        right.setStyle("-fx-text-fill: #7d8794; -fx-border-color: transparent; -fx-padding: 0;");
        right.setOnAction(e -> footerRightAction.run());
        footer.getChildren().add(right);

        VBox actions = new VBox(16, signIn, footer);
        actions.setPrefWidth(Double.MAX_VALUE);

        card.getChildren().addAll(iconBox, heading, subtitle, usernameLabel, username, passwordLabel, password, feedback, actions);

        if (showCreateAccount) {
            Hyperlink createAccount = new Hyperlink("Create Account →");
            createAccount.setStyle("-fx-text-fill: #2c8a57; -fx-font-weight: 700; -fx-border-color: transparent; -fx-padding: 0;");
            createAccount.setOnAction(e -> navigator.show(new RegistrationView(navigator)));
            card.getChildren().add(createAccount);
        }

        root.setCenter(card);
        BorderPane.setAlignment(card, Pos.CENTER);
        BorderPane.setMargin(card, new Insets(40));
        Scene scene = new Scene(root, 1600, 900);
        return scene;
    }

    private Label createFieldLabel(String text) {
        Label label = new Label(text);
        label.setStyle("-fx-text-fill: #4b5563; -fx-font-size: 14; -fx-font-weight: 700;");
        return label;
    }

    protected SceneNavigator navigator() {
        return navigator;
    }

    protected abstract boolean matchesRole(Role role);

    protected abstract void openDashboard();
}
