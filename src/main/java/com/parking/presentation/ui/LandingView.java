package com.parking.presentation.ui;

import com.parking.presentation.SceneNavigator;
import com.parking.presentation.View;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;

public class LandingView implements View {
    private final SceneNavigator navigator;

    public LandingView(SceneNavigator navigator) {
        this.navigator = navigator;
    }

    @Override
    public Scene buildScene() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom, #13283b 0%, #15293a 55%, #102131 100%);");

        root.setTop(buildTopBar());
        root.setCenter(buildHero());

        Scene scene = new Scene(root, 1600, 900);
        return scene;
    }

    private HBox buildTopBar() {
        HBox bar = new HBox(12);
        bar.setAlignment(Pos.CENTER_LEFT);
        bar.setPadding(new Insets(20, 44, 18, 44));
        bar.setStyle("-fx-background-color: rgba(10, 18, 28, 0.45); -fx-border-color: rgba(255,255,255,0.06); -fx-border-width: 0 0 1 0;");

        Label logoIcon = new Label("🚗");
        logoIcon.setStyle("-fx-text-fill: #35d06d; -fx-font-size: 20;");

        Label brand = new Label("VPMS");
        brand.setStyle("-fx-text-fill: #38d26f; -fx-font-size: 22; -fx-font-weight: 800;");

        HBox brandBlock = new HBox(8, logoIcon, brand);
        brandBlock.setAlignment(Pos.CENTER_LEFT);

        Region spacer = new Region();
        HBox.setHgrow(spacer, javafx.scene.layout.Priority.ALWAYS);

        Button userLogin = createGhostButton("👤 User Login", () -> navigator.show(new UserLoginView(navigator)));
        Button adminLogin = createPrimaryButton("🛡 Admin Login", () -> navigator.show(new AdminLoginView(navigator)));

        bar.getChildren().addAll(brandBlock, spacer, userLogin, adminLogin);
        return bar;
    }

    private StackPane buildHero() {
        VBox hero = new VBox(24);
        hero.setAlignment(Pos.CENTER);
        hero.setPadding(new Insets(60, 40, 40, 40));

        Label badge = new Label("🛡 Secure & Smart System");
        badge.setStyle("-fx-text-fill: #41d47a; -fx-font-size: 15; -fx-font-weight: 700; -fx-background-color: rgba(65, 212, 122, 0.08); -fx-padding: 8 18 8 18; -fx-background-radius: 18; -fx-border-color: rgba(65, 212, 122, 0.12); -fx-border-radius: 18;");

        Label title = new Label("Smart Parking\nManagement Made\nEasy");
        title.setAlignment(Pos.CENTER);
        title.setStyle("-fx-text-fill: white; -fx-font-size: 76; -fx-font-weight: 900; -fx-text-alignment: center; -fx-line-spacing: 6;");

        Label parking = new Label("Parking");
        parking.setStyle("-fx-text-fill: #35d06d; -fx-font-size: 76; -fx-font-weight: 900;");

        // We keep the centered headline by replacing the middle line with a colored word.
        VBox titleBox = new VBox(-4);
        titleBox.setAlignment(Pos.CENTER);
        HBox line1 = new HBox();
        line1.setAlignment(Pos.CENTER);
        Label smart = new Label("Smart ");
        smart.setStyle("-fx-text-fill: white; -fx-font-size: 76; -fx-font-weight: 900;");
        parking.setStyle("-fx-text-fill: #35d06d; -fx-font-size: 76; -fx-font-weight: 900;");
        line1.getChildren().addAll(smart, parking);

        Label line2 = new Label("Management Made");
        line2.setStyle("-fx-text-fill: white; -fx-font-size: 76; -fx-font-weight: 900;");

        Label line3 = new Label("Easy");
        line3.setStyle("-fx-text-fill: white; -fx-font-size: 76; -fx-font-weight: 900;");

        titleBox.getChildren().addAll(line1, line2, line3);

        Label description = new Label("Track vehicle entry & exit, manage parking slots,\nhandle memberships and generate reports — all in one platform.");
        description.setAlignment(Pos.CENTER);
        description.setStyle("-fx-text-fill: rgba(255,255,255,0.68); -fx-font-size: 22; -fx-text-alignment: center; -fx-line-spacing: 6;");

        HBox ctas = new HBox(16,
            createGhostButton("👤 User Login", () -> navigator.show(new UserLoginView(navigator))),
            createPrimaryButton("🛡 Admin Login", () -> navigator.show(new AdminLoginView(navigator)))
        );
        ctas.setAlignment(Pos.CENTER);

        HBox pills = new HBox(12,
                createPill("🚗 Vehicle Tracking"),
                createPill("🅿 Slot Management"),
                createPill("👥 User Membership"),
                createPill("📊 Reports")
        );
        pills.setAlignment(Pos.CENTER);

        Button searchPill = createPill("🔎 Search");

        VBox bottom = new VBox(12, pills, searchPill);
        bottom.setAlignment(Pos.CENTER);

        hero.getChildren().addAll(badge, titleBox, description, ctas, bottom);

        VBox container = new VBox(hero);
        container.setAlignment(Pos.CENTER);
        container.setPadding(new Insets(20, 40, 40, 40));

        StackPane wrapper = new StackPane(container);
        wrapper.setStyle("-fx-background-color: transparent;");
        return wrapper;
    }

    private Button createPrimaryButton(String text, Runnable action) {
        Button button = new Button(text);
        button.setStyle("-fx-background-color: linear-gradient(to right, #38d26f, #2fcb6a); -fx-text-fill: white; -fx-font-size: 16; -fx-font-weight: 800; -fx-background-radius: 28; -fx-padding: 12 24 12 24; -fx-cursor: hand;");
        button.setOnAction(e -> action.run());
        return button;
    }

    private Button createGhostButton(String text, Runnable action) {
        Button button = new Button(text);
        button.setStyle("-fx-background-color: rgba(255,255,255,0.02); -fx-border-color: rgba(65, 212, 122, 0.5); -fx-border-width: 1.4; -fx-text-fill: white; -fx-font-size: 16; -fx-font-weight: 800; -fx-background-radius: 28; -fx-border-radius: 28; -fx-padding: 12 24 12 24; -fx-cursor: hand;");
        button.setOnAction(e -> action.run());
        return button;
    }

    private Button createPill(String text) {
        Button pill = new Button(text);
        pill.setDisable(true);
        pill.setStyle("-fx-opacity: 1; -fx-background-color: rgba(255,255,255,0.08); -fx-border-color: rgba(255,255,255,0.06); -fx-border-radius: 999; -fx-background-radius: 999; -fx-text-fill: rgba(255,255,255,0.72); -fx-font-size: 15; -fx-font-weight: 700; -fx-padding: 10 18 10 18;");
        return pill;
    }
}