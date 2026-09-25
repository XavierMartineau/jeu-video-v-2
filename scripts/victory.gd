extends Control

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    create_screen()

func create_screen() -> void:
    var background := ColorRect.new()
    background.color = Color("#183542")
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(background)
    var title := make_label("MISSION ACCOMPLIE", Vector2(0, 150), Vector2(1280, 70), 48, Color("#f4c95d"))
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    var subtitle := make_label("Le coeur du geant est enfin apaise.", Vector2(0, 235), Vector2(1280, 45), 22, Color("#b8f2e6"))
    subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    var replay := Button.new()
    replay.text = "REJOUER L'AVENTURE"
    replay.position = Vector2(440, 350)
    replay.size = Vector2(400, 58)
    replay.add_theme_font_size_override("font_size", 20)
    replay.pressed.connect(func():
        get_tree().root.set_meta("start_level", 1)
        get_tree().change_scene_to_file("res://scenes/main.tscn")
    )
    add_child(replay)

func make_label(text_value: String, position_value: Vector2, size_value: Vector2, font_size: int, color: Color) -> Label:
    var label := Label.new()
    label.text = text_value
    label.position = position_value
    label.size = size_value
    label.add_theme_font_size_override("font_size", font_size)
    label.add_theme_color_override("font_color", color)
    add_child(label)
    return label