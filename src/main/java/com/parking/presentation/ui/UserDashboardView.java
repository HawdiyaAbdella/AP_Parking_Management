package com.parking.presentation.ui;

import com.parking.domain.model.ParkingSlot;
import com.parking.domain.model.Reservation;
import com.parking.domain.model.ReservationStatus;
import com.parking.domain.model.SlotStatus;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.View;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class UserDashboardView implements View {
    private enum Section {
        DASHBOARD("Dashboard"),
        BOOK_PARKING("Book Parking"),
        MY_VEHICLES("My Vehicles");

        private final String label;

        Section(String label) {
            this.label = label;
        }

        public String label() {
            return label;
        }
    }

    private record BookingDetails(
            int reservationId,
            int slotId,
            String category,
            String company,
            String registrationNumber,
            String ownerName,
            String ownerContact,
            LocalDateTime bookedAt,
            ReservationStatus status
    ) {
    }

    private record BookingRow(
            int reservationId,
            String parkingNumber,
            String category,
            String company,
            String registrationNumber,
            String ownerName,
            String ownerContact,
            String status,
            String bookedAt
    ) {
    }

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final List<String> CATEGORIES = List.of(
            "Select Category",
            "Six Wheeler Vehicles",
            "Four Wheeler Vehicle",
            "Two Wheeler Vehicle",
            "Bicycles"
    );
    private static final Map<Integer, BookingDetails> BOOKING_CACHE = new HashMap<>();

    private final SceneNavigator navigator;
    private final ObjectProperty<Section> activeSection = new SimpleObjectProperty<>(Section.DASHBOARD);
    private final Map<Section, Button> sidebarButtons = new EnumMap<>(Section.class);
    private StackPane contentHost;
    private Label sectionTitleLabel;
    private Label sectionSubtitleLabel;

    public UserDashboardView(SceneNavigator navigator) {
        this.navigator = navigator;
    }

    @Override
    public Scene buildScene() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #f3f5f9;");
        root.setLeft(buildSidebar());
        root.setCenter(buildMainArea());
        showSection(Section.DASHBOARD);
        return new Scene(root, 1600, 900);
    }

    private Node buildSidebar() {
        VBox sidebar = new VBox(18);
        sidebar.setPrefWidth(260);
        sidebar.setPadding(new Insets(24, 18, 24, 18));
        sidebar.setStyle("-fx-background-color: #111827;");

        HBox brandRow = new HBox(12);
        brandRow.setAlignment(Pos.CENTER_LEFT);

        Label logo = new Label("🚗");
        logo.setStyle("-fx-font-size: 24; -fx-text-fill: white;");

        VBox brandText = new VBox(2);
        Label brand = new Label("VPMS");
        brand.setStyle("-fx-text-fill: white; -fx-font-size: 20; -fx-font-weight: 700;");
        Label brandSub = new Label("User Portal");
        brandSub.setStyle("-fx-text-fill: #cbd5e1; -fx-font-size: 11;");
        brandText.getChildren().addAll(brand, brandSub);
        brandRow.getChildren().addAll(logo, brandText);

        VBox nav = new VBox(8,
                createSidebarButton(Section.DASHBOARD, "🏠 Dashboard"),
                createSidebarButton(Section.BOOK_PARKING, "➕ Book Parking"),
                createSidebarButton(Section.MY_VEHICLES, "🚘 My Vehicles")
        );

        Region spacer = new Region();
        VBox.setVgrow(spacer, Priority.ALWAYS);

        Button logout = new Button("⏻ Logout");
        logout.setMaxWidth(Double.MAX_VALUE);
        logout.setPrefHeight(42);
        logout.setStyle(sidebarButtonStyle(false, true));
        logout.setOnAction(e -> {
            navigator.context().logout();
            navigator.show(new LandingView(navigator));
        });

        sidebar.getChildren().addAll(brandRow, nav, spacer, logout);
        return sidebar;
    }

    private Node buildMainArea() {
        VBox main = new VBox(18);
        main.setPadding(new Insets(22));
        main.setStyle("-fx-background-color: #f3f5f9;");

        sectionTitleLabel = new Label();
        sectionTitleLabel.setStyle("-fx-font-size: 30; -fx-font-weight: 800; -fx-text-fill: #111827;");

        sectionSubtitleLabel = new Label();
        sectionSubtitleLabel.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 14;");

        VBox titleBlock = new VBox(4, sectionTitleLabel, sectionSubtitleLabel);

        Label userChip = new Label("👤 " + navigator.context().currentUser().username());
        userChip.setStyle("-fx-background-color: white; -fx-background-radius: 18; -fx-padding: 10 16 10 16; -fx-text-fill: #111827; -fx-border-color: #e5e7eb; -fx-border-radius: 18;");

        HBox topBar = new HBox(12, titleBlock, new Region(), userChip);
        HBox.setHgrow(topBar.getChildren().get(1), Priority.ALWAYS);
        topBar.setAlignment(Pos.CENTER_LEFT);

        contentHost = new StackPane();
        contentHost.setStyle("-fx-background-color: transparent;");

        ScrollPane scrollPane = new ScrollPane(contentHost);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background: transparent; -fx-background-color: transparent;");
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        main.getChildren().addAll(topBar, scrollPane);
        VBox.setVgrow(scrollPane, Priority.ALWAYS);
        return main;
    }

    private Button createSidebarButton(Section section, String text) {
        Button button = new Button(text);
        button.setMaxWidth(Double.MAX_VALUE);
        button.setPrefHeight(42);
        button.setAlignment(Pos.CENTER_LEFT);
        button.setStyle(sidebarButtonStyle(false, false));
        button.setOnAction(e -> showSection(section));
        sidebarButtons.put(section, button);
        return button;
    }

    private void showSection(Section section) {
        activeSection.set(section);
        sectionTitleLabel.setText(section.label());
        sectionSubtitleLabel.setText(switch (section) {
            case DASHBOARD -> "Welcome, " + navigator.context().currentUser().username();
            case BOOK_PARKING -> "Book a slot and store your vehicle details.";
            case MY_VEHICLES -> "Review your bookings and parking history.";
        });
        updateSidebarSelection();
        contentHost.getChildren().setAll(buildSection(section));
    }

    private void updateSidebarSelection() {
        sidebarButtons.forEach((section, button) -> button.setStyle(sidebarButtonStyle(section == activeSection.get(), false)));
    }

    private String sidebarButtonStyle(boolean active, boolean danger) {
        if (danger) {
            return "-fx-background-color: #1f2937; -fx-text-fill: #f87171; -fx-font-size: 13; -fx-font-weight: 700; -fx-background-radius: 12; -fx-border-radius: 12; -fx-cursor: hand; -fx-alignment: center-left;";
        }
        if (active) {
            return "-fx-background-color: #2563eb; -fx-text-fill: white; -fx-font-size: 13; -fx-font-weight: 700; -fx-background-radius: 12; -fx-border-radius: 12; -fx-cursor: hand; -fx-alignment: center-left;";
        }
        return "-fx-background-color: transparent; -fx-text-fill: #d1d5db; -fx-font-size: 13; -fx-font-weight: 600; -fx-background-radius: 12; -fx-border-radius: 12; -fx-cursor: hand; -fx-alignment: center-left;";
    }

    private Node buildSection(Section section) {
        return switch (section) {
            case DASHBOARD -> buildDashboardSection();
            case BOOK_PARKING -> buildBookParkingSection();
            case MY_VEHICLES -> buildMyVehiclesSection();
        };
    }

    private Node buildDashboardSection() {
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        List<Reservation> myReservations = navigator.context().reservationUseCase().getReservationsByUser(navigator.context().currentUser().id());
        long currentlyParked = myReservations.stream().filter(r -> r.status() == ReservationStatus.ACTIVE).count();
        long available = slots.stream().filter(slot -> slot.status() == SlotStatus.AVAILABLE).count();
        long totalCapacity = slots.size();

        VBox page = new VBox(18,
                buildStatsGrid(currentlyParked, available, totalCapacity),
                buildQuickActionsRow(),
                buildParkingStatusCard(slots, myReservations),
                buildRecentReservationsCard(myReservations)
        );
        return page;
    }

    private Node buildBookParkingSection() {
        ComboBox<String> categoryCombo = new ComboBox<>();
        categoryCombo.getItems().addAll(CATEGORIES);
        categoryCombo.setValue(CATEGORIES.get(0));
        categoryCombo.setPrefHeight(40);
        categoryCombo.setMaxWidth(Double.MAX_VALUE);

        TextField companyField = new TextField();
        companyField.setPromptText("Vehicle company");
        companyField.setPrefHeight(40);

        TextField registrationField = new TextField();
        registrationField.setPromptText("Registration number");
        registrationField.setPrefHeight(40);

        TextField ownerNameField = new TextField();
        ownerNameField.setText(navigator.context().currentUser().username());
        ownerNameField.setPrefHeight(40);

        TextField contactField = new TextField();
        contactField.setPromptText("Owner contact number");
        contactField.setPrefHeight(40);

        Label feedback = createFeedbackLabel();

        Button bookButton = createPrimaryButton("Add", () -> {
            String category = categoryCombo.getValue();
            String company = safeTrim(companyField.getText());
            String registration = safeTrim(registrationField.getText());
            String ownerName = safeTrim(ownerNameField.getText());
            String contact = safeTrim(contactField.getText());

            if (category == null || category.equals(CATEGORIES.get(0))) {
                feedback.setText("Please select a category.");
                return;
            }
            if (company.isEmpty() || registration.isEmpty() || ownerName.isEmpty() || contact.isEmpty()) {
                feedback.setText("Please complete all fields.");
                return;
            }

            List<ParkingSlot> availableSlots = navigator.context().slotUseCase().getAllSlots().stream()
                    .filter(slot -> slot.status() == SlotStatus.AVAILABLE)
                    .collect(Collectors.toList());
            if (availableSlots.isEmpty()) {
                feedback.setText("No available parking slots.");
                return;
            }

            ParkingSlot chosenSlot = availableSlots.get(0);
            navigator.context().slotUseCase().reserveSlot(navigator.context().currentUser().id(), chosenSlot.id());

            Optional<Reservation> createdReservation = navigator.context().reservationUseCase().getReservationsByUser(navigator.context().currentUser().id()).stream()
                    .filter(reservation -> reservation.slotId() == chosenSlot.id() && reservation.status() == ReservationStatus.ACTIVE)
                    .max(Comparator.comparing(Reservation::startTime));

            createdReservation.ifPresent(reservation -> BOOKING_CACHE.put(reservation.id(), new BookingDetails(
                    reservation.id(),
                    reservation.slotId(),
                    category,
                    company,
                    registration,
                    ownerName,
                    contact,
                    LocalDateTime.now(),
                    reservation.status()
            )));

            feedback.setText("Vehicle booked successfully in parking slot " + chosenSlot.name() + ".");
            showSection(Section.MY_VEHICLES);
        });

        GridPane form = new GridPane();
        form.setHgap(20);
        form.setVgap(18);
        form.add(formLabel("Select"), 0, 0);
        form.add(categoryCombo, 1, 0);
        form.add(formLabel("Vehicle Company"), 0, 1);
        form.add(companyField, 1, 1);
        form.add(formLabel("Registration Number"), 0, 2);
        form.add(registrationField, 1, 2);
        form.add(formLabel("Owner Name"), 0, 3);
        form.add(ownerNameField, 1, 3);
        form.add(formLabel("Owner Contact Number"), 0, 4);
        form.add(contactField, 1, 4);
        form.add(bookButton, 1, 5);
        form.add(feedback, 1, 6);
        GridPane.setHgrow(categoryCombo, Priority.ALWAYS);
        GridPane.setHgrow(companyField, Priority.ALWAYS);
        GridPane.setHgrow(registrationField, Priority.ALWAYS);
        GridPane.setHgrow(ownerNameField, Priority.ALWAYS);
        GridPane.setHgrow(contactField, Priority.ALWAYS);

        VBox card = new VBox(16,
                sectionCardHeader("Add Vehicle", "Book a parking slot by entering vehicle details"),
                form
        );
        card.setStyle(cardStyle());
        card.setPadding(new Insets(22));

        return new VBox(16, pageHeader("Add Vehicle", "Fill in the form to book parking."), card);
    }

    private Node buildMyVehiclesSection() {
        TableView<BookingRow> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<BookingRow, String> parkingNumber = column("Parking Number", BookingRow::parkingNumber);
        TableColumn<BookingRow, String> category = column("Category", BookingRow::category);
        TableColumn<BookingRow, String> company = column("Vehicle Company", BookingRow::company);
        TableColumn<BookingRow, String> registration = column("Vehicle Reg Number", BookingRow::registrationNumber);
        TableColumn<BookingRow, String> ownerName = column("Owner Name", BookingRow::ownerName);
        TableColumn<BookingRow, String> contact = column("Contact", BookingRow::ownerContact);
        TableColumn<BookingRow, String> status = column("Status", BookingRow::status);
        TableColumn<BookingRow, String> bookedAt = column("Booked At", BookingRow::bookedAt);

        TableColumn<BookingRow, BookingRow> actions = new TableColumn<>("Action");
        actions.setCellValueFactory(param -> new javafx.beans.property.SimpleObjectProperty<>(param.getValue()));
        actions.setCellFactory(column -> new javafx.scene.control.TableCell<>() {
            private final Button viewButton = new Button("View");
            private final Button printButton = new Button("Print");
            private final HBox wrapper = new HBox(8, viewButton, printButton);

            {
                wrapper.setAlignment(Pos.CENTER_LEFT);
                viewButton.setOnAction(event -> {
                    BookingRow row = getItem();
                    if (row != null) {
                        showBookingInfo(row);
                    }
                });
                printButton.setOnAction(event -> {
                    BookingRow row = getItem();
                    if (row != null) {
                        showInfo("Print", "Print requested for booking #" + row.reservationId() + ".");
                    }
                });
            }

            @Override
            protected void updateItem(BookingRow item, boolean empty) {
                super.updateItem(item, empty);
                setGraphic(empty ? null : wrapper);
            }
        });

        table.getColumns().addAll(parkingNumber, category, company, registration, ownerName, contact, status, bookedAt, actions);
        table.setItems(buildBookingRows());

        VBox card = new VBox(14,
                sectionCardHeader("My Vehicles", "Track your booked parking entries"),
                table
        );
        card.setStyle(cardStyle());
        card.setPadding(new Insets(22));
        VBox.setVgrow(table, Priority.ALWAYS);

        return new VBox(16, pageHeader("My Vehicles", "View and print your bookings."), card);
    }

    private VBox pageHeader(String title, String subtitle) {
        Label heading = new Label(title);
        heading.setStyle("-fx-font-size: 22; -fx-font-weight: 800; -fx-text-fill: #111827;");
        Label text = new Label(subtitle);
        text.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 13;");
        return new VBox(4, heading, text);
    }

    private Node buildStatsGrid(long currentlyParked, long available, long totalCapacity) {
        HBox row = new HBox(18,
                metricCard("#ef4444", "🚗", currentlyParked, "Currently Parked"),
                metricCard("#22c55e", "🅿", available, "Available Slots"),
                metricCard("#3b82f6", "▦", totalCapacity, "Total Capacity")
        );
        HBox.setHgrow(row.getChildren().get(0), Priority.ALWAYS);
        HBox.setHgrow(row.getChildren().get(1), Priority.ALWAYS);
        HBox.setHgrow(row.getChildren().get(2), Priority.ALWAYS);
        return row;
    }

    private Node buildQuickActionsRow() {
        HBox actions = new HBox(10,
                quickActionButton("+ Book Parking", Section.BOOK_PARKING),
                quickActionButton("🚘 My Vehicles", Section.MY_VEHICLES)
        );
        actions.setAlignment(Pos.CENTER_LEFT);

        VBox card = new VBox(12, sectionCardHeader("Quick Actions", "Fast access to user tasks"), actions);
        card.setStyle(cardStyle());
        card.setPadding(new Insets(18));
        return card;
    }

    private Node buildParkingStatusCard(List<ParkingSlot> slots, List<Reservation> myReservations) {
        long total = slots.size();
        long occupied = myReservations.stream().filter(reservation -> reservation.status() == ReservationStatus.ACTIVE).count();
        long free = Math.max(0, total - occupied);

        HBox row = new HBox(18,
                miniMetric("#dcfce7", "#22c55e", total, "Total"),
                miniMetric("#fee2e2", "#ef4444", occupied, "Occupied"),
                miniMetric("#dbeafe", "#3b82f6", free, "Free")
        );

        VBox card = new VBox(12, sectionCardHeader("Parking Status", "Current parking overview"), row);
        card.setStyle(cardStyle());
        card.setPadding(new Insets(18));
        return card;
    }

    private Node buildRecentReservationsCard(List<Reservation> reservations) {
        ListView<String> list = new ListView<>();
        list.getItems().addAll(reservations.stream()
                .sorted(Comparator.comparing(Reservation::startTime).reversed())
                .map(this::formatReservation)
                .collect(Collectors.toList()));
        VBox.setVgrow(list, Priority.ALWAYS);

        VBox card = new VBox(12, sectionCardHeader("Recent Reservations", "Latest user activity"), list);
        card.setStyle(cardStyle());
        card.setPadding(new Insets(18));
        return card;
    }

    private Node miniMetric(String background, String accent, long value, String label) {
        VBox card = new VBox(6);
        card.setAlignment(Pos.CENTER);
        card.setPrefSize(150, 90);
        card.setStyle("-fx-background-color: " + background + "; -fx-background-radius: 14;");

        Label valueLabel = new Label(String.valueOf(value));
        valueLabel.setStyle("-fx-font-size: 28; -fx-font-weight: 800; -fx-text-fill: " + accent + ";");

        Label textLabel = new Label(label);
        textLabel.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 13;");

        card.getChildren().addAll(valueLabel, textLabel);
        return card;
    }

    private VBox sectionCardHeader(String title, String subtitle) {
        Label heading = new Label(title);
        heading.setStyle("-fx-font-size: 17; -fx-font-weight: 800; -fx-text-fill: #111827;");

        VBox header = new VBox(2);
        header.getChildren().add(heading);
        if (subtitle != null && !subtitle.isBlank()) {
            Label sub = new Label(subtitle);
            sub.setStyle("-fx-text-fill: #6b7280; -fx-font-size: 12;");
            header.getChildren().add(sub);
        }
        return header;
    }

    private Label formLabel(String text) {
        Label label = new Label(text);
        label.setStyle("-fx-text-fill: #374151; -fx-font-size: 13; -fx-font-weight: 700;");
        return label;
    }

    private Label createFeedbackLabel() {
        Label feedback = new Label();
        feedback.setStyle("-fx-text-fill: #b91c1c; -fx-font-size: 12;");
        return feedback;
    }

    private Button createPrimaryButton(String text, Runnable action) {
        Button button = new Button(text);
        button.setPrefHeight(40);
        button.setStyle("-fx-background-color: #2563eb; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 12; -fx-cursor: hand;");
        button.setOnAction(e -> action.run());
        return button;
    }

    private Button quickActionButton(String text, Section section) {
        Button button = new Button(text);
        button.setPrefHeight(38);
        button.setStyle("-fx-background-color: #e5e7eb; -fx-background-radius: 12; -fx-text-fill: #111827; -fx-font-weight: 700; -fx-cursor: hand;");
        button.setOnAction(e -> showSection(section));
        return button;
    }

    private String cardStyle() {
        return "-fx-background-color: white; -fx-background-radius: 18; -fx-border-radius: 18; -fx-border-color: #e5e7eb; -fx-effect: dropshadow(gaussian, rgba(15, 23, 42, 0.08), 18, 0.10, 0, 4);";
    }

    private Node metricCard(String color, String icon, long value, String label) {
        VBox card = new VBox(10);
        card.setPrefHeight(150);
        card.setPadding(new Insets(18));
        card.setStyle("-fx-background-color: linear-gradient(to bottom right, " + color + ", derive(" + color + ", -10%)); -fx-background-radius: 18; -fx-border-radius: 18; -fx-effect: dropshadow(gaussian, rgba(15, 23, 42, 0.15), 18, 0.12, 0, 6);");

        Label iconLabel = new Label(icon);
        iconLabel.setStyle("-fx-font-size: 24; -fx-text-fill: white;");

        Label valueLabel = new Label(String.valueOf(value));
        valueLabel.setStyle("-fx-font-size: 34; -fx-font-weight: 800; -fx-text-fill: white;");

        Label textLabel = new Label(label);
        textLabel.setStyle("-fx-font-size: 13; -fx-text-fill: rgba(255,255,255,0.92);");

        card.getChildren().addAll(iconLabel, valueLabel, textLabel);
        return card;
    }

    private ObservableList<BookingRow> buildBookingRows() {
        int userId = navigator.context().currentUser().id();
        List<Reservation> reservations = navigator.context().reservationUseCase().getReservationsByUser(userId);
        List<BookingRow> rows = new ArrayList<>();

        for (Reservation reservation : reservations) {
            BookingDetails details = BOOKING_CACHE.get(reservation.id());
            rows.add(new BookingRow(
                    reservation.id(),
                    "P-" + reservation.slotId(),
                    details == null ? "General" : details.category(),
                    details == null ? "N/A" : details.company(),
                    details == null ? "N/A" : details.registrationNumber(),
                    details == null ? navigator.context().currentUser().username() : details.ownerName(),
                    details == null ? "N/A" : details.ownerContact(),
                    reservation.status().name(),
                    reservation.startTime().format(DATE_TIME_FORMATTER)
            ));
        }

        return FXCollections.observableArrayList(rows);
    }

    private String formatReservation(Reservation reservation) {
        BookingDetails details = BOOKING_CACHE.get(reservation.id());
        String company = details == null ? "N/A" : details.company();
        String reg = details == null ? "N/A" : details.registrationNumber();
        return "#" + reservation.id() + " • Slot " + reservation.slotId() + " • " + reservation.status() + " • " + company + " • " + reg;
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private void showBookingInfo(BookingRow row) {
        String content = "Parking Number: " + row.parkingNumber() + "\n"
                + "Category: " + row.category() + "\n"
                + "Vehicle Company: " + row.company() + "\n"
                + "Registration Number: " + row.registrationNumber() + "\n"
                + "Owner Name: " + row.ownerName() + "\n"
                + "Contact: " + row.ownerContact() + "\n"
                + "Status: " + row.status() + "\n"
                + "Booked At: " + row.bookedAt();
        showInfo("Booking #" + row.reservationId(), content);
    }

    private void showInfo(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(title);
        alert.setContentText(content);
        alert.showAndWait();
    }

    private TableColumn<BookingRow, String> column(String title, java.util.function.Function<BookingRow, String> getter) {
        TableColumn<BookingRow, String> column = new TableColumn<>(title);
        column.setCellValueFactory(param -> new SimpleStringProperty(getter.apply(param.getValue())));
        return column;
    }
}
