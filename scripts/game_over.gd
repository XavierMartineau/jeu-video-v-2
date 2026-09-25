extends Control

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    create_screen()

func create_screen() -> void:
    var background := ColorRect.new()
    background.color = Color("#241d32")
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(background)
    var title := make_label("OMBRE VAINCUE", Vector2(0, 150), Vector2(1280, 70), 48, Color("#e86f51"))
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    var subtitle := make_label("Le Wraith doit reprendre des forces.", Vector2(0, 235), Vector2(1280, 45), 22, Color("#b8f2e6"))
    subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    var retry := Button.new()
    retry.text = "RECOMMENCER L'AVENTURE"
    retry.position = Vector2(440, 340)
    retry.size = Vector2(400, 58)
    retry.add_theme_font_size_override("font_size", 20)
    retry.pressed.connect(func(): start_game(1))
    add_child(retry)
    var boss := Button.new()
    boss.text = "REPRENDRE LE NIVEAU BOSS"
    boss.position = Vector2(440, 420)
    boss.size = Vector2(400, 58)
    boss.add_theme_font_size_override("font_size", 20)
    boss.pressed.connect(func(): start_game(4))
    add_child(boss)

func make_label(text_value: String, position_value: Vector2, size_value: Vector2, font_size: int, color: Color) -> Label:
    var label := Label.new()
    label.text = text_value
    label.position = position_value
    label.size = size_value
    label.add_theme_font_size_override("font_size", font_size)
    label.add_theme_color_override("font_color", color)
    add_child(label)
    return label

func start_game(level: int) -> void:
    get_tree().root.set_meta("start_level", level)
    get_tree().change_scene_to_file("res://scenes/main.tscn")