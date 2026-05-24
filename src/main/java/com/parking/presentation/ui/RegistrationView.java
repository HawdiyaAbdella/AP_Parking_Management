package com.parking.presentation.ui;

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

public class RegistrationView implements View {
    private final SceneNavigator navigator;

    public RegistrationView(SceneNavigator navigator) {
        this.navigator = navigator;
    }

    @Override
    public Scene buildScene() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom right, #1f2f44 0%, #22384d 50%, #1a2940 100%);");

        VBox card = new VBox(12);
        card.setAlignment(Pos.CENTER);
        card.setPadding(new Insets(36, 40, 32, 40));
        card.setPrefWidth(460);
        card.setStyle("-fx-background-color: white; -fx-background-radius: 18; -fx-effect: dropshadow(gaussian, rgba(15,23,42,0.18), 26, 0.18, 0, 8);");

        Label icon = new Label("👤");
        icon.setStyle("-fx-font-size: 34; -fx-background-color: linear-gradient(to bottom, #4cd97d,#28c76f); -fx-text-fill: white; -fx-background-radius: 12; -fx-padding: 12; -fx-alignment: center;");

        Label heading = new Label("Create Account");
        heading.setStyle("-fx-font-size: 22; -fx-font-weight: 800; -fx-text-fill: #111827;");

        Label subtitle = new Label("Create a new user account to start booking parking slots.");
        subtitle.setStyle("-fx-text-fill: #8b98a6; -fx-font-size: 13; -fx-wrap-text: true;");

        Label userLabel = new Label("Username");
        userLabel.setStyle("-fx-text-fill: #475569; -fx-font-weight: 700;");
        TextField username = new TextField();
        username.setPromptText("Choose a username");

        Label passLabel = new Label("Password");
        passLabel.setStyle("-fx-text-fill: #475569; -fx-font-weight: 700;");
        PasswordField password = new PasswordField();
        password.setPromptText("Choose a password");

        Label feedback = new Label();
        feedback.setStyle("-fx-text-fill: #b00020;");

        Button register = new Button("Create Account");
        register.setMaxWidth(Double.MAX_VALUE);
        register.setPrefHeight(44);
        register.setStyle("-fx-background-color: linear-gradient(to right, #39c86f, #2dbd63); -fx-text-fill: white; -fx-font-weight: 800; -fx-background-radius: 10;");
        register.setOnAction(e -> {
            try {
                var maybe = navigator.context().authUseCase().register(username.getText(), password.getText());
                if (maybe.isEmpty()) {
                    feedback.setText("Username already taken");
                    return;
                }
                User u = maybe.get();
                navigator.context().setCurrentUser(u);
                navigator.show(new UserDashboardView(navigator));
            } catch (Exception ex) {
                feedback.setText("Registration failed: " + ex.getMessage());
            }
        });

        HBox footer = new HBox(8);
        footer.setAlignment(Pos.CENTER_LEFT);
        Hyperlink back = new Hyperlink("← Back to Login");
        back.setOnAction(ev -> navigator.show(new UserLoginView(navigator)));
        Region spacer = new Region();
        HBox.setHgrow(spacer, javafx.scene.layout.Priority.ALWAYS);
        footer.getChildren().addAll(back, spacer);

        card.getChildren().addAll(icon, heading, subtitle, userLabel, username, passLabel, password, feedback, register, footer);

        root.setCenter(card);
        BorderPane.setAlignment(card, Pos.CENTER);
        BorderPane.setMargin(card, new Insets(40));

        return new Scene(root, 900, 600);
    }
}
