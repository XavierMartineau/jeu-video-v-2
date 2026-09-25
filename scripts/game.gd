extends Node2D

var current_level: Node
var level_number := 1
var total_coins := 0
var collected_coins := 0
var is_muted := false
var player_lives := 3

@onready var hud = $HUD

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    var start_level := int(get_tree().root.get_meta("start_level", 1))
    get_tree().root.remove_meta("start_level")
    load_level(start_level)

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("pause_game"):
        toggle_pause()

func load_level(number: int) -> void:
    if is_instance_valid(current_level):
        current_level.queue_free()
    level_number = number
    var scene_path := "res://scenes/level-4-boss-fight.tscn" if number == 4 else "res://scenes/level_%d.tscn" % number
    var packed_level := load(scene_path)
    current_level = packed_level.instantiate()
    current_level.game = self
    current_level.level_completed.connect(_on_level_completed)
    current_level.player_died.connect(_on_player_died)
    add_child(current_level)
    hud.show_gameplay()
    hud.update_level(level_number)
    hud.update_coins(collected_coins, current_level.required_coins)
    hud.update_lives(player_lives)

func _on_level_completed() -> void:
    if level_number < 4:
        hud.show_message("NIVEAU %d TERMINE !" % level_number, "Le prochain secteur est debloque")
        await get_tree().create_timer(1.6).timeout
        load_level(level_number + 1)
    else:
        get_tree().paused = false
        get_tree().change_scene_to_file("res://scenes/victory.tscn")

func _on_player_died() -> void:
    player_lives -= 1
    hud.update_lives(player_lives)
    if player_lives <= 0:
        get_tree().paused = false
        get_tree().root.set_meta("defeat_level", level_number)
        get_tree().change_scene_to_file("res://scenes/game_over.tscn")
    else:
        hud.show_message("AIE !", "Retour au dernier point de depart")
        await get_tree().create_timer(0.8).timeout
        current_level.reset_player()

func collect_coin() -> void:
    collected_coins += 1
    hud.update_coins(collected_coins, current_level.required_coins)

func toggle_pause() -> void:
    get_tree().paused = not get_tree().paused
    hud.set_pause_visible(get_tree().paused)

func toggle_volume() -> void:
    is_muted = not is_muted
    AudioServer.set_bus_mute(AudioServer.get_bus_index("Master"), is_muted)
    hud.update_volume(is_muted)

func restart_level() -> void:
    get_tree().paused = false
    player_lives = 3
    load_level(level_number)

func restart_game() -> void:
    get_tree().paused = false
    collected_coins = 0
    player_lives = 3
    load_level(1)
