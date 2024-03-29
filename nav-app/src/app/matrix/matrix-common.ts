import { Input, Directive } from '@angular/core';
import { Matrix, Technique, Tactic } from '../classes/stix';
import { ViewModelsService } from '../services/viewmodels.service';
import { ConfigService } from '../services/config.service';
import { ViewModel } from '../classes';
import tinycolor from 'tinycolor2';

@Directive()
export abstract class MatrixCommon {
    @Input() matrix: Matrix;
    @Input() viewModel: ViewModel;

    constructor(
        public configService: ConfigService,
        public viewModelsService: ViewModelsService
    ) {
        this.configService = configService;
    }

    /**
     * filter tactics according to viewmodel state
     * @param {Tactic[]} tactics to filter
     * @returns {Tactic[]} filtered tactics
     */
    public filterTactics(tactics: Tactic[]): Tactic[] {
        return this.viewModel.filterTactics(tactics, this.matrix);
    }

    /**
     * filter techniques according to viewModel state
     * @param {Technique[]} techniques list of techniques to filter
     * @param {Tactic} tactic tactic the techniques fall under
     * @returns {Technique[]} filtered techniques
     */
    public filterTechniques(techniques: Technique[], tactic: Tactic): Technique[] {
        return this.viewModel.filterTechniques(techniques, tactic, this.matrix);
    }

    /**
     * sort techniques accoding to viewModel state
     * @param {Technique[]} techniques techniques to sort
     * @param {Tactic} tactic tactic the techniques fall under
     * @returns {Technique[]} sorted techniques
     */
    public sortTechniques(techniques: Technique[], tactic: Tactic): Technique[] {
        return this.viewModel.sortTechniques(techniques, tactic);
    }

    /**
     * apply sort and filter state to techniques
     * @param {Technique[]} techniques techniques to sort and filter
     * @param {Tactic} tactic that the techniques fall under
     * @returns {Technique[]} sorted and filtered techniques
     */
    public applyControls(techniques: Technique[], tactic: Tactic): Technique[] {
        return this.viewModel.applyControls(techniques, tactic, this.matrix);
    }

    public onTechniqueLeftClick(event: any, technique: Technique, tactic: Tactic) {
        if (!this.configService.getFeature('selecting_techniques')) {
            //if selecting is disabled, same behavior as right click. Shouldn't ever get to this point because it should be handled in technique-cell
            return;
        }
        if (event.shift || event.ctrl || event.meta) {
            // add to selection
            if (this.viewModel.isTechniqueSelected(technique, tactic)) this.viewModel.unselectTechnique(technique, tactic);
            else this.viewModel.selectTechnique(technique, tactic);
        } else {
            // replace selection
            if (this.viewModel.getSelectedTechniqueCount() > 1) {
                if (this.viewModel.isTechniqueSelected(technique, tactic)) this.viewModel.clearSelectedTechniques();
                this.viewModel.selectTechnique(technique, tactic);
            } else if (this.viewModel.isTechniqueSelected(technique, tactic)) {
                //unselect currently selected
                this.viewModel.clearSelectedTechniques();
            } else {
                //replace
                this.viewModel.clearSelectedTechniques();
                this.viewModel.selectTechnique(technique, tactic);
            }
        }
        this.viewModelsService.onSelectionChange.emit();
    }

    public onToggleSubtechniquesVisible(technique: Technique, tactic: Tactic) {
        if (technique.subtechniques.length == 0) return;
        let tvm = this.viewModel.getTechniqueVM(technique, tactic);
        tvm.showSubtechniques = !tvm.showSubtechniques;
    }

    public onTechniqueHighlight(event: any, technique: Technique, tactic: Tactic) {
        this.viewModel.highlightTechnique(technique, tactic);
    }
    public onTechniqueUnhighlight(event: any) {
        this.viewModel.clearHighlight();
    }

    public onTacticClick(tactic: Tactic) {
        if (this.viewModel.isTacticSelected(tactic)) this.viewModel.unselectAllTechniquesInTactic(tactic);
        else this.viewModel.selectAllTechniquesInTactic(tactic);
    }

    public getTacticBackground(): any {
        if (this.viewModel.showTacticRowBackground)
            return {
                background: this.viewModel.tacticRowBackground,
                color: tinycolor.mostReadable(this.viewModel.tacticRowBackground, ['white', 'black']),
            };
        else {
            return {};
        }
    }
}
